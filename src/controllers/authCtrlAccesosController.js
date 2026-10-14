const mfaController = require('./mfaController');
const { generarSesionDesdeJson } = require('../middlewares/auth');

/**
 * Helper para aplicar la sesión a un usuario en base a la información del data recibida de Control de Accesos
 * SIN CONSULTAR BASE DE DATOS
 * @param {object} data
 * @param {object} req
 * @param {object} res
 */
async function aplicarSesionUsuario(data, req, res) {
    const resultado = generarSesionDesdeJson(data, res, req);
    return resultado.usuario;
}

exports.loginKeycloak = async (req, res) => {
    console.log('Body loginKeycloak:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: process.env.GRANT_TYPE || 'password',
        scope: process.env.SCOPE || 'openid',
        username,
        password
    });

    try {
        const response = await fetch(process.env.CTRL_ACCESS_TOKEN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error_description || data.error || 'Credenciales inválidas'
            });
        }

        const kcToken = data.access_token;

        // Generar el token de MFA que está en mfaController.js
        let mfaToken = null;
        let mfaData = null;
        try {
            mfaData = await mfaController.generarTokenMFA(username);
            mfaToken = mfaData?.token || mfaData?.data?.token || (typeof mfaData?.data === 'string' ? mfaData.data : null);
        } catch (mfaError) {
            console.error('Error al generar token de MFA en loginKeycloak:', mfaError.message || mfaError);
        }

        return res.json({
            success: true,
            token: kcToken,
            mfaToken,
            mfaData,
            email: username
        });
    } catch (error) {
        console.error('Error al conectar con Keycloak:', error);
        return res.status(500).json({ error: 'Error interno al comunicarse con Keycloak' });
    }
};

exports.getUserInfo = async (req, res) => {
    const token = req.body?.token || req.query?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) {
        return res.status(400).json({ error: 'Token no proporcionado' });
    }

    try {
        const response = await fetch(process.env.CTRL_ACCESS_USERINFO, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error_description || data.error || 'Token inválido o expirado'
            });
        }

        return res.json({ success: true, token: data, data });
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        return res.status(500).json({ error: 'Error interno al obtener la información del usuario' });
    }
};

exports.getUser = async (req, res) => {
    const token = req.body?.token || req.query?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    const sub = req.body?.sub || req.query?.sub;
    const email = req.body?.email || req.query?.email;

    if (!token || !sub) {
        return res.status(400).json({ error: 'Token y sub son obligatorios' });
    }

    try {
        const response = await fetch(process.env.CTRL_ACCESS_ROLES + `?uid=${sub}&appid=${process.env.APPID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error_description || data.error || 'Error al obtener roles del usuario'
            });
        }

        // Crear la sesión tomando como información el data y pasándoselo a aplicarSesionUsuario
        await aplicarSesionUsuario(data, req, res);

        return res.json({ success: true, token: data, data, sesionCreada: true });
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        return res.status(500).json({ error: error.message || 'Error interno al obtener la información del usuario' });
    }
};

exports.crearSesionUsuario = async (req, res) => {
    const data = req.body?.data || req.body;
    try {
        await aplicarSesionUsuario(data, req, res);
        return res.json({ success: true, msg: 'Sesión creada exitosamente' });
    } catch (error) {
        console.error('Error al crear sesión:', error);
        return res.status(500).json({ error: error.message || 'Error al crear la sesión' });
    }
};