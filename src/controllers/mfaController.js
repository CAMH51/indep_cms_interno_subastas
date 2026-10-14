const getApiMFA = () => process.env.API_MFA || 'http://localhost:3200/api/v1';

/**
 * Genera el token de MFA consultando la API de MFA
 * @param {string} email
 * @returns {Promise<any>}
 */
async function generarTokenMFA(email) {
    const url = `${getApiMFA()}/token`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al obtener token MFA');
    }
    return data;
}

exports.generarTokenMFA = generarTokenMFA;

exports.getToken = async (req, res) => {
    const email = req.body?.email || req.body?.username;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email o username requerido' });
    }
    try {
        const data = await generarTokenMFA(email);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message || error });
    }
};

exports.getOTP = async (req, res) => {
    const url = `${getApiMFA()}/mfa/login`;
    const authHeader = req.headers.authorization;
    const token = req.body?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);
    const isActiveDirectory = req.body?.isActiveDirectory !== undefined ? req.body.isActiveDirectory : true;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                isActiveDirectory: isActiveDirectory === true || isActiveDirectory === 'true'
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: data.message || data.error || 'Error al enviar código OTP',
                data
            });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message || error });
    }
};

exports.getVerifyOTP = async (req, res) => {
    const url = `${getApiMFA()}/mfa/verify`;
    const code = req.body?.code;
    const id = req.body?.id || req.body?.id_user;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Código de verificación requerido' });
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code,
                id,
                id_user: id
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
            return res.status(response.ok ? 400 : response.status).json({
                success: false,
                error: data.message || data.error || 'Código incorrecto o expirado',
                data
            });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message || error });
    }
};