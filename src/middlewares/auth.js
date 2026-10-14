const crypto = require('crypto');
const {Usuario, Rol, Sesion} = require('../models');
const {
    verificarAccessToken,
    verificarRefreshToken,
    generarAccessToken,
    generarRefreshToken,
    duracionAMilisegundos,
    ACCESS_EXPIRES_IN
} = require('../utils/jws');
const {renovarSesion, obtenerPermisosDeUsuario} = require('../services/sesion.service');
const {opcionesAccessCookie, opcionesRefreshCookie} = require('../utils/cookies');
const activeStorage = require('./activeStorage');

/**
 * Diccionario de equivalencias entre las acciones del JSON de Control de Accesos
 * y los nombres de acciones comunes en el CMS / endpoints.
 */
const MAPA_ACCIONES = {
    read: ['read', 'leer', 'consultar', 'ver'],
    write: ['write', 'actualizar', 'editar', 'escribir', 'modificar'],
    add: ['add', 'crear', 'nuevo', 'agregar', 'alta'],
    delete: ['delete', 'eliminar', 'borrar', 'baja'],
    rename: ['rename', 'renombrar'],
    import: ['import', 'importar'],
    export: ['export', 'exportar'],
    sign: ['sign', 'firmar'],
    archive: ['archive', 'archivar'],
    workflow: ['workflow', 'flujo'],
    download: ['download', 'descargar'],
    print: ['print', 'imprimir']
};

/**
 * Normaliza las acciones de permissions del JSON hacia llaves combinadas (screen.accion, modulo.accion, ruta.accion).
 * @param {Array} menus 
 * @param {boolean} esSuperAdmin 
 * @returns {Array<string>}
 */
function normalizarPermisosDesdeMenus(menus, esSuperAdmin) {
    const permisosSet = new Set();

    if (esSuperAdmin) {
        permisosSet.add('*');
    }

    if (!Array.isArray(menus)) return Array.from(permisosSet);

    menus.forEach(m => {
        if (!m) return;
        const screenCode = m.screen ? String(m.screen).trim() : null;
        const rutaName = m.name ? String(m.name).trim() : null;
        
        // Identificadores: screen, ruta completa, módulo base (ej. /entities/new -> entities)
        const segmentosRuta = rutaName ? rutaName.replace(/^\//, '').split('/') : [];
        const moduloBase = segmentosRuta.length > 0 ? segmentosRuta[0] : null;

        const identificadores = [
            screenCode,
            rutaName,
            moduloBase,
            moduloBase && !moduloBase.endsWith('s') ? `${moduloBase}s` : null
        ].filter(Boolean);

        if (m.permissions && typeof m.permissions === 'object') {
            Object.keys(m.permissions).forEach(k => {
                const valor = m.permissions[k];
                if (valor === 1 || valor === true || valor === '1') {
                    const sinonimos = MAPA_ACCIONES[k] || [k];
                    identificadores.forEach(id => {
                        sinonimos.forEach(sin => {
                            permisosSet.add(`${id}.${sin}`);
                            permisosSet.add(`${id.toLowerCase()}.${sin.toLowerCase()}`);
                        });
                    });
                }
            });
        }

        // Si tiene submenus, procesar recursivamente
        if (Array.isArray(m.submenus) && m.submenus.length > 0) {
            normalizarPermisosDesdeMenus(m.submenus, false).forEach(p => permisosSet.add(p));
        }
    });

    return Array.from(permisosSet);
}

/**
 * Crea las funciones helpers de validación de permisos: puede() y puedeAccion()
 * @param {Array<string>} permisos 
 * @param {boolean} esSuperAdmin 
 */
function crearValidadorPermisos(permisos, esSuperAdmin) {
    const permisosArray = Array.isArray(permisos) ? permisos : [];
    const permisosLower = new Set(permisosArray.map(p => String(p).toLowerCase()));

    const puede = (permisoRequerido) => {
        if (esSuperAdmin) return true;
        if (!permisoRequerido) return true;
        if (permisosLower.has('*')) return true;

        const reqLower = String(permisoRequerido).trim().toLowerCase();
        if (permisosLower.has(reqLower)) return true;

        const partes = reqLower.split('.');
        if (partes.length === 2 && permisosLower.has(`${partes[0]}.*`)) {
            return true;
        }

        return false;
    };

    const puedeAccion = (recurso, accion) => {
        if (esSuperAdmin) return true;
        if (!recurso || !accion) return false;
        return puede(`${recurso}.${accion}`);
    };

    return { puede, puedeAccion };
}

/**
 * Extrae y normaliza toda la información del usuario, roles, menús y permisos
 * a partir de la estructura JSON recibida de Control de Accesos SIN consultar base de datos.
 * @param {object} data 
 * @returns {object|null}
 */
function extraerInfoDeJson(data) {
    if (!data) return null;
    let usuarioInfo = null;

    if (Array.isArray(data.usuario) && data.usuario.length > 0) {
        usuarioInfo = data.usuario[0];
    } else if (data.usuario && typeof data.usuario === 'object') {
        usuarioInfo = data.usuario;
    } else if (data.id || data.email || data.uid) {
        usuarioInfo = data;
    }

    if (!usuarioInfo) return null;

    const email = usuarioInfo.email || '';
    const rolesArray = Array.isArray(usuarioInfo.roles) ? usuarioInfo.roles : [];
    const primerRol = rolesArray[0] || null;
    const rolNombre = primerRol?.name || 'SuperAdmin';
    const rolDescripcion = primerRol?.description || rolNombre;
    const menus = Array.isArray(primerRol?.menus) ? primerRol.menus : [];

    const partesNombre = [
        usuarioInfo.name,
        usuarioInfo.secondName,
        usuarioInfo.surname,
        usuarioInfo.lastsurname
    ].filter(Boolean);
    const nombreCompleto = partesNombre.length > 0 ? partesNombre.join(' ') : (usuarioInfo.name || email);

    const usuarioId = usuarioInfo.uid || usuarioInfo.id || 'usr-' + Date.now();
    const esSuperAdmin = rolNombre === 'SuperAdmin' || rolNombre.toLowerCase().includes('admin');

    // Normalizar lista completa de permisos con sinónimos e identificadores
    const permisos = normalizarPermisosDesdeMenus(menus, esSuperAdmin);

    const rolObj = {
        id: primerRol?.id || 143,
        nombre: rolNombre,
        name: rolNombre,
        descripcion: rolDescripcion,
        description: rolDescripcion
    };

    const usuarioObj = {
        usuario_id: usuarioId,
        id: usuarioInfo.id,
        uid: usuarioInfo.uid,
        name: usuarioInfo.name,
        secondName: usuarioInfo.secondName,
        surname: usuarioInfo.surname,
        lastsurname: usuarioInfo.lastsurname,
        street: usuarioInfo.street,
        internalnumber: usuarioInfo.internalnumber,
        externalnumber: usuarioInfo.externalnumber,
        phone: usuarioInfo.phone,
        mobile: usuarioInfo.mobile,
        phonework: usuarioInfo.phonework,
        email: email,
        ine: usuarioInfo.ine,
        socialsecurity: usuarioInfo.socialsecurity,
        facebook: usuarioInfo.facebook,
        instagram: usuarioInfo.instagram,
        twitter: usuarioInfo.twitter,
        postalcode: usuarioInfo.postalcode,
        type: usuarioInfo.type,
        deleted: usuarioInfo.deleted || 0,
        creation: usuarioInfo.creation,
        lastmodified: usuarioInfo.lastmodified,
        nombreCompleto: nombreCompleto,
        rol: rolObj,
        roles: rolesArray,
        menus: menus,
        activo: usuarioInfo.deleted === 0,
        mfa: true,
        dataValues: {
            usuario_id: usuarioId,
            id: usuarioInfo.id,
            uid: usuarioInfo.uid,
            name: usuarioInfo.name,
            surname: usuarioInfo.surname,
            nombreCompleto: nombreCompleto,
            email: email,
            activo: true,
            mfa: true,
            type: usuarioInfo.type,
            roles: rolesArray
        }
    };

    return {
        usuarioInfo,
        usuarioObj,
        rolesArray,
        primerRol,
        rolObj,
        rolNombre,
        rolDescripcion,
        menus,
        permisos,
        email,
        usuarioId,
        nombreCompleto,
        esSuperAdmin
    };
}

/**
 * Genera la sesión en base al JSON de Control de Accesos SIN CONSULTAR BASE DE DATOS.
 * Establece los tokens JWT (accessToken y refreshToken) y las cookies correspondientes.
 * @param {object} data JSON con estructura de usuario, roles, menus
 * @param {object} res Objeto response de Express
 * @param {object} req Objeto request de Express (opcional)
 * @returns {object} Objeto con tokens y usuario
 */
function generarSesionDesdeJson(data, res, req) {
    const info = extraerInfoDeJson(data);
    if (!info) {
        throw new Error('Estructura de datos inválida de control de accesos');
    }

    const csrfToken = crypto.randomBytes(32).toString('hex');
    const payloadSesion = {
        sinBD: true,
        id: info.usuarioId,
        uid: info.usuarioInfo.uid,
        email: info.email,
        name: info.usuarioInfo.name,
        surname: info.usuarioInfo.surname,
        nombreCompleto: info.nombreCompleto,
        rol: info.rolNombre,
        rolDescripcion: info.rolDescripcion,
        roles: info.rolesArray,
        menus: info.menus,
        permisos: info.permisos,
        csrfToken: csrfToken,
        usuario: info.usuarioObj
    };

    const accessToken = generarAccessToken(payloadSesion);
    const refreshToken = generarRefreshToken({
        sinBD: true,
        id: info.usuarioId,
        uid: info.usuarioInfo.uid,
        email: info.email,
        rol: info.rolNombre,
        csrfToken: csrfToken
    });

    if (res && typeof res.cookie === 'function') {
        res.cookie('accessToken', accessToken, opcionesAccessCookie);
        res.cookie('refreshToken', refreshToken, opcionesRefreshCookie);

        res.cookie('user_menus', JSON.stringify(info.menus), {
            httpOnly: false,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'lax',
            path: '/'
        });

        res.cookie('user_rol', info.rolNombre, {
            httpOnly: false,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'lax',
            path: '/'
        });

        res.cookie('csrfToken', csrfToken, {
            httpOnly: false,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'lax',
            path: '/'
        });
    }

    if (req) {
        const mockSesion = {
            sesion_id: info.usuarioId,
            activa: true,
            csr_token: csrfToken,
            dataValues: {
                sesion_id: info.usuarioId,
                csr_token: csrfToken,
                activa: true
            },
            update: async () => {}
        };

        const { puede, puedeAccion } = crearValidadorPermisos(info.permisos, info.esSuperAdmin);

        req.usuario = info.usuarioObj;
        req.sesion = mockSesion;
        req.permisos = info.permisos;
        req.menus = info.menus;
        req.rolNombre = info.rolNombre;
        req.puede = puede;
        req.puedeAccion = puedeAccion;

        if (res && res.locals) {
            res.locals.usuarioActual = info.usuarioObj;
            res.locals.permisos = info.permisos;
            res.locals.csrfToken = csrfToken;
            res.locals.menus = info.menus;
            res.locals.rolNombre = info.rolNombre;
            res.locals.puede = puede;
            res.locals.puedeAccion = puedeAccion;
        }
    }

    activeStorage.invalidate();
    return {
        accessToken,
        refreshToken,
        csrfToken,
        usuario: info.usuarioObj,
        menus: info.menus,
        rol: info.rolNombre
    };
}

async function autenticar(req, res, next) {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    const noAutenticado = () => {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ success: false, msg: 'No autenticado' });
        }
        return res.redirect('/login');
    };

    // Si viene la información del JSON directamente en el body de la petición
    if (req.body?.usuario || (req.body?.roles && req.body?.name)) {
        try {
            generarSesionDesdeJson(req.body, res, req);
            return next();
        } catch (e) {
            console.error('Error al generar sesión desde req.body:', e);
        }
    }

    if (!accessToken && !refreshToken) return noAutenticado();

    try {
        let payload;
        let sessionRenovada = false;

        try {
            payload = verificarAccessToken(accessToken);
        } catch (error) {
            if (!refreshToken) return noAutenticado();

            const payloadRefresh = verificarRefreshToken(refreshToken);

            // Si es sesión sin base de datos (stateless)
            if (payloadRefresh.sinBD || !payloadRefresh.sid) {
                let menusRecuperados = [];
                if (req.cookies?.user_menus) {
                    try { menusRecuperados = JSON.parse(req.cookies.user_menus); } catch (e) {}
                }
                const rolRecuperado = req.cookies?.user_rol || payloadRefresh.rol || 'SuperAdmin';
                const csrfTokenRecuperado = payloadRefresh.csrfToken || req.cookies?.csrfToken || crypto.randomBytes(32).toString('hex');

                const nuevoAccessToken = generarAccessToken({
                    sinBD: true,
                    id: payloadRefresh.id,
                    uid: payloadRefresh.uid,
                    email: payloadRefresh.email,
                    rol: rolRecuperado,
                    menus: menusRecuperados,
                    csrfToken: csrfTokenRecuperado
                });

                res.cookie('accessToken', nuevoAccessToken, opcionesAccessCookie);
                payload = verificarAccessToken(nuevoAccessToken);
                sessionRenovada = true;
            } else {
                // Sesión tradicional con base de datos
                const { accessToken: nuevoAccessToken } = await renovarSesion(
                    payloadRefresh.sid,
                    refreshToken
                );

                res.cookie('accessToken', nuevoAccessToken, opcionesAccessCookie);
                payload = verificarAccessToken(nuevoAccessToken);
                sessionRenovada = true;
            }
        }

        // =========================================================================
        // PROCESAMIENTO SIN BASE DE DATOS (Stateless / Control de Accesos JSON)
        // =========================================================================
        if (payload.sinBD || !payload.sid || payload.usuario || payload.roles) {
            let usuario = payload.usuario;
            const rolNombre = payload.rol || usuario?.rol?.nombre || (payload.roles && payload.roles[0]?.name) || req.cookies?.user_rol || 'SuperAdmin';
            const rolDescripcion = payload.rolDescripcion || usuario?.rol?.descripcion || (payload.roles && payload.roles[0]?.description) || rolNombre;

            let menus = payload.menus || usuario?.roles?.[0]?.menus;
            if (!menus || !Array.isArray(menus) || menus.length === 0) {
                if (req.cookies?.user_menus) {
                    try {
                        menus = JSON.parse(req.cookies.user_menus);
                    } catch (e) {
                        menus = [];
                    }
                } else {
                    menus = [];
                }
            }

            if (!usuario) {
                const nombreCompleto = payload.nombreCompleto || [payload.name, payload.surname].filter(Boolean).join(' ') || payload.email;
                usuario = {
                    usuario_id: payload.id || payload.uid,
                    id: payload.id,
                    uid: payload.uid,
                    name: payload.name,
                    surname: payload.surname,
                    nombreCompleto: nombreCompleto,
                    email: payload.email,
                    activo: true,
                    mfa: true,
                    rol: {
                        id: 143,
                        nombre: rolNombre,
                        name: rolNombre,
                        descripcion: rolDescripcion,
                        description: rolDescripcion
                    },
                    roles: payload.roles || [{ id: 143, name: rolNombre, description: rolDescripcion, menus }],
                    menus: menus,
                    dataValues: {
                        usuario_id: payload.id || payload.uid,
                        id: payload.id,
                        uid: payload.uid,
                        nombreCompleto: nombreCompleto,
                        email: payload.email,
                        activo: true,
                        mfa: true
                    }
                };
            }

            if (!usuario.rol) {
                usuario.rol = { id: 143, nombre: rolNombre, name: rolNombre, descripcion: rolDescripcion };
            }
            if (!usuario.dataValues) {
                usuario.dataValues = { ...usuario };
            }

            const esSuperAdmin = rolNombre === 'SuperAdmin' || rolNombre.toLowerCase().includes('admin');
            let permisos = payload.permisos;
            if (!Array.isArray(permisos) || permisos.length === 0) {
                permisos = normalizarPermisosDesdeMenus(menus, esSuperAdmin);
            } else if (esSuperAdmin && !permisos.includes('*')) {
                permisos.push('*');
            }

            const { puede, puedeAccion } = crearValidadorPermisos(permisos, esSuperAdmin);

            const csrfToken = payload.csrfToken || req.cookies?.csrfToken || 'sin-csrf';
            const mockSesion = {
                sesion_id: payload.id || payload.uid || 'stateless-session',
                activa: true,
                csr_token: csrfToken,
                dataValues: {
                    sesion_id: payload.id || payload.uid || 'stateless-session',
                    csr_token: csrfToken,
                    activa: true
                },
                update: async () => {}
            };

            req.usuario = usuario;
            req.sesion = mockSesion;
            req.permisos = permisos;
            req.menus = menus;
            req.rolNombre = rolNombre;
            req.puede = puede;
            req.puedeAccion = puedeAccion;

            res.locals.usuarioActual = usuario;
            res.locals.permisos = permisos;
            res.locals.csrfToken = csrfToken;
            res.locals.menus = menus;
            res.locals.rolNombre = rolNombre;

            res.locals.puede = puede;
            res.locals.puedeAccion = puedeAccion;
            res.locals.sesionRenovada = sessionRenovada;
            res.locals.accessTokenTtlMs = duracionAMilisegundos(ACCESS_EXPIRES_IN);

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // Salir sin consultar base de datos
            return next();
        }

        // =========================================================================
        // PROCESAMIENTO CON BASE DE DATOS (Sesiones locales previas con sid)
        // =========================================================================
        const sesion = await Sesion.findByPk(payload.sid);
        if (!sesion || !sesion.activa) return noAutenticado();

        const usuario = await Usuario.findByPk(payload.id, {
            include: { model: Rol, as: 'rol' },
        });
        if (!usuario || !usuario.activo) return noAutenticado();

        sesion.update({ ultimo_uso: new Date() }).catch(() => {});

        const permisos = await obtenerPermisosDeUsuario(usuario.dataValues.usuario_id);

        let menus = payload.menus;
        if (!menus || !Array.isArray(menus) || menus.length === 0) {
            if (req.cookies?.user_menus) {
                try {
                    menus = JSON.parse(req.cookies.user_menus);
                } catch (e) {
                    menus = [];
                }
            } else {
                menus = [];
            }
        }

        const rolNombre = payload.rol || req.cookies?.user_rol || (usuario.rol ? usuario.rol.nombre : '');
        const esSuperAdmin = rolNombre === 'SuperAdmin' || rolNombre.toLowerCase().includes('admin');
        const { puede, puedeAccion } = crearValidadorPermisos(permisos, esSuperAdmin);

        req.usuario = usuario;
        req.sesion = sesion;
        req.permisos = permisos;
        req.menus = menus;
        req.rolNombre = rolNombre;
        req.puede = puede;
        req.puedeAccion = puedeAccion;

        res.locals.usuarioActual = usuario;
        res.locals.permisos = permisos;
        res.locals.csrfToken = sesion.dataValues.csr_token;
        res.locals.menus = menus;
        res.locals.rolNombre = rolNombre;

        res.locals.puede = puede;
        res.locals.puedeAccion = puedeAccion;
        res.locals.sesionRenovada = sessionRenovada;

        res.locals.accessTokenTtlMs = duracionAMilisegundos(ACCESS_EXPIRES_IN);

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        next();
    } catch (error) {
        return noAutenticado();
    }
}

async function soloInvitados(req, res, next) {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) return next();
    try {
        verificarAccessToken(accessToken);
        return res.redirect('/dashboard');
    } catch (error) {
        return next();
    }
}

module.exports = {
    autenticar,
    soloInvitados,
    generarSesionDesdeJson,
    extraerInfoDeJson
};