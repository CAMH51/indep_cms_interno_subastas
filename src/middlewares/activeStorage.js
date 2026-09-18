const {Storage} = require('../models');

let cachedStorage = null;
let cacheExpiresAt = 0;
const TTL = 60 * 1000;

const activeStorage = async (req, res, next)=>{
    try {
        if(cachedStorage && Date.now() < cacheExpiresAt){
            req.storage = cachedStorage;
            return next();
        }

        const storage = await Storage.findOne({where:{activo:true}});

        if(!storage) {
            return res.status(500).render('login', {
                titulo: 'Iniciar Sesión',
                error: 'No hay almacenamiento activo configurado.',
            });
        }

        cachedStorage = storage;
        cacheExpiresAt = Date.now() + TTL;

        req.storage = storage;
        res.locals.storage = storage;
        next();
    } catch (error) {
        next(error);
    }
}


activeStorage.invalidate = () =>{
    cachedStorage = null;
    cacheExpiresAt = 0;
}

module.exports = activeStorage;