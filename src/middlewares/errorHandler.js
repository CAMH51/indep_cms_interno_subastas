function manejadorNotFound(req, res){
    res.status(404).render('error',{
        titulo: 'Página no encontrada',
        mensaje: `La ruta ${req.originalUrl} no existe.`
    });
}

function manejadorErrores(err, req, res, next){
    console.log('Error no controlado:', err);

    const status = err.status || 500;
    res.status(status).render('dashboard',{
        page:'error',
        titulo:'Error interno',
        mensaje:
            process.env.NODE_ENV === 'production'
                ? 'Ocurrio un error inesperado. Intenta nuevamente más tarde'
                : err.message,
    });
}

module.exports = {manejadorNotFound,manejadorErrores};