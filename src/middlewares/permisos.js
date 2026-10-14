function verificarPermiso(permisoRequerido){
    return (req, res, next) =>{
        const rolNombre = req.rolNombre || req.usuario?.rol?.nombre || '';
        const esSuperAdmin = rolNombre === 'SuperAdmin' || (rolNombre && rolNombre.toLowerCase().includes('admin'));
        const permisos = req.permisos || [];

        // Si ya está inyectada la función puede en req o res.locals, usarla directamente
        if (typeof req.puede === 'function' && req.puede(permisoRequerido)) {
            return next();
        }

        if (esSuperAdmin || permisos.includes('*')) {
            return next();
        }

        const permisoLower = String(permisoRequerido).trim().toLowerCase();
        const tienePermiso = permisos.some(p => String(p).toLowerCase() === permisoLower || p === permisoRequerido);

        if (tienePermiso) {
            return next();
        }

        if (req.xhr || req.headers.accept?.includes('application/json')){
            return res.status(403).json({
                success: false, 
                msg: `No tienes permiso para esta acción (${permisoRequerido})`
            });
        }

        return res.status(403).render('dashboard',{
            page: 'error',
            titulo: 'Acceso denegado',
            mensaje: `No cuentas con permisos suficientes para acceder a este recurso (${permisoRequerido}).`,
        });
    };
}

function verificarCsrf(req, res, next){
    const tokenEnviado= req.body?._csrf || req.headers['x-csrf-token'];
    const tokenSesion = res.locals.csrfToken;

    if(req.path === '/auth/login' && req.method === 'POST') return next();

    if(!tokenSesion || tokenEnviado !== tokenSesion){
        return res.status(403).render('dashboard',{
            page:'error',
            titulo:'Petición rechazada',
            mensaje:'Token de seguridad invalido o expirado. Recarga la pagina e intenta nuevamente.'
        });
    }
    next();
}

module.exports = {verificarPermiso, verificarCsrf};