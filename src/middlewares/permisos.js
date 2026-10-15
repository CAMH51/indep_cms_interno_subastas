function denegarAcceso(req, res, recurso) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({
            success: false,
            msg: `No tienes permisos suficientes para acceder o realizar esta acción sobre: ${recurso}`
        });
    }

    return res.status(403).render('dashboard', {
        page: 'error',
        titulo: 'Acceso Denegado',
        mensaje: `No cuentas con permisos suficientes para acceder a este recurso (${recurso}).`
    });
}

/**
 * Busca de forma recursiva en el árbol de menús del JSON si el usuario tiene asignada
 * una entidad/pantalla y si cuenta con el permiso requerido (read, add, write, delete).
 */
function verificarPermisoEnArbolMenus(menus, entityName, accion = 'leer') {

    console.log('menus',menus)
    if (!Array.isArray(menus) || !entityName) return false;

    const entLower = String(entityName).toLowerCase();

    for (const m of menus) {
        if (!m) continue;

        const screenLower = (m.screen || '').toLowerCase();
        const nameLower = (m.name || '').toLowerCase();

        const coincide = 
            nameLower === `/entities/${entLower}` ||
            nameLower === `/${entLower}` ||
            nameLower === entLower ||
            screenLower === entLower ||
            screenLower === `ent_${entLower}` ||
            screenLower === `lib_${entLower}`;

        if (coincide && m.permissions && typeof m.permissions === 'object') {
            const perms = m.permissions;
            if (accion === 'leer' || accion === 'read') {
                if (perms.read === 1 || perms.read === true || perms.read === '1') return true;
            } else if (accion === 'crear' || accion === 'add') {
                if (perms.add === 1 || perms.add === true || perms.add === '1' ||
                    perms.write === 1 || perms.write === true || perms.write === '1') return true;
            } else if (accion === 'actualizar' || accion === 'write') {
                if (perms.write === 1 || perms.write === true || perms.write === '1') return true;
            } else if (accion === 'eliminar' || accion === 'delete') {
                if (perms.delete === 1 || perms.delete === true || perms.delete === '1' ||
                    perms.write === 1 || perms.write === true || perms.write === '1') return true;
            }
        }

        if (Array.isArray(m.submenus) && m.submenus.length > 0) {
            if (verificarPermisoEnArbolMenus(m.submenus, entityName, accion)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Middleware para validar permisos en pantallas existentes:
 * /dashboard, /documentos, /usuarios, /roles, etc.
 * SuperAdmin siempre tiene acceso irrestricto.
 */
function verificarPermiso(permisoRequerido) {
    return (req, res, next) => {
        const rolNombre = req.rolNombre || req.usuario?.rol?.nombre || '';
        const esSuperAdmin = rolNombre === 'SuperAdmin' || (rolNombre && rolNombre.toLowerCase().includes('admin'));

        // Regla: SuperAdmin puede ver y hacer todo
        if (esSuperAdmin) {
            return next();
        }

        const permisos = req.permisos || [];

        // Si ya está inyectada la función puede en req o res.locals, usarla directamente
        if (typeof req.puede === 'function' && req.puede(permisoRequerido)) {
            return next();
        }

        if (permisos.includes('*')) {
            return next();
        }

        const permisoLower = String(permisoRequerido).trim().toLowerCase();
        const tienePermiso = permisos.some(p => {
            const pLower = String(p).toLowerCase();
            return pLower === permisoLower || pLower.startsWith(`${permisoLower}.`);
        });

        if (tienePermiso) {
            return next();
        }

        return denegarAcceso(req, res, permisoRequerido);
    };
}

/**
 * Middleware para validar permisos sobre librerías y entidades dinámicas:
 * - Creación de librerías (/entities/new, POST /entities)
 * - Registros y acciones de entidades dinámicas (/entities/:name, /entities/:name/records, etc.)
 * SuperAdmin siempre tiene acceso irrestricto.
 */
function verificarPermisoEntidad(accion = 'leer') {
    return (req, res, next) => {
        const rolNombre = req.rolNombre || req.usuario?.rol?.nombre || '';
        const esSuperAdmin = rolNombre === 'SuperAdmin' || (rolNombre && rolNombre.toLowerCase().includes('admin'));

        // Regla: SuperAdmin puede ver y hacer todo
        if (esSuperAdmin) {
            return next();
        }

        const entityName = req.params.name;

        // Caso 1: Rutas de creación de librerías (/entities/new o POST /entities)
        if (!entityName || req.path === '/new' || (req.path === '/' && req.method === 'POST')) {
            const puedeCrearLibreria = typeof req.puede === 'function' && (
                req.puede('CRELIB') || 
                req.puede('/entities/new') || 
                req.puede('entities.crear') ||
                req.puede('entities.add') ||
                req.puede('entities')
            );

            if (puedeCrearLibreria) {
                return next();
            }

            return denegarAcceso(req, res, 'Crear Librería (CRELIB)');
        }

        // Caso 2: Operaciones sobre una entidad específica (:name)
        const mapeoAccionSinonimos = {
            leer: ['read', 'leer', 'ver'],
            crear: ['add', 'crear', 'write', 'actualizar'],
            actualizar: ['write', 'actualizar', 'editar'],
            eliminar: ['delete', 'eliminar', 'write', 'actualizar']
        };

        const sinonimos = mapeoAccionSinonimos[accion] || [accion];

        // 1. Probar con función req.puede()
        if (typeof req.puede === 'function') {
            for (const s of sinonimos) {
                if (
                    req.puede(`${entityName}.${s}`) ||
                    req.puede(`entities.${entityName}.${s}`) ||
                    req.puede(`/entities/${entityName}.${s}`)
                ) {
                    return next();
                }
            }
            if (accion === 'leer' && (req.puede(entityName) || req.puede(`/entities/${entityName}`))) {
                return next();
            }
        }

        // 2. Probar directamente en los menús del JSON
        const menus = req.menus || req.usuario?.menus || [];
        if (verificarPermisoEnArbolMenus(menus, entityName, accion)) {
            return next();
        }

        return denegarAcceso(req, res, `Librería ${entityName} (${accion})`);
    };
}

function verificarCsrf(req, res, next) {
    const tokenEnviado = req.body?._csrf || req.headers['x-csrf-token'];
    const tokenSesion = res.locals.csrfToken;

    if (req.path === '/auth/login' && req.method === 'POST') return next();

    if (!tokenSesion || tokenEnviado !== tokenSesion) {
        return res.status(403).render('dashboard', {
            page: 'error',
            titulo: 'Petición rechazada',
            mensaje: 'Token de seguridad inválido o expirado. Recarga la página e intenta nuevamente.'
        });
    }
    next();
}

module.exports = {
    verificarPermiso,
    verificarPermisoEntidad,
    verificarPermisoEnArbolMenus,
    verificarCsrf
};