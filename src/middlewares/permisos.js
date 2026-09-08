function verificarPermiso(permisoRequerido){
    return (req, res, next) =>{
        const permisos = req.permisos || [];

        if(permisos.includes(permisoRequerido)){
            return next();
        }

        if(req.xhr || req.headers.accept?.includes('application/json')){
            return res.status(403).json({success:false, msg:'No tienes permiso para esta accion'})
        }

        return res.status(403).render('dashboard',{
            page:'error',
            titulo:'Acceso denegado',
            mensaje: 'No cuentas con permisos suficientes para acceder a este recurso.',
        });
    }
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