const {Storage} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.listar = async() =>{
    try {
        const storages = await Storage.findAll({order: [['createdAt', 'DESC']]});
        return storages;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id) =>{
    try {
        const storage = await Storage.findOne({where:{storage_id:id}});
        return storage
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const activo = data.activo !== false;

        if(activo){
            await Storage.update(
                {activo:false},
                {where:{},transaction: t}
            );
        }

        const nuevo = await Storage.create({
            name:data.name,
            base_path:data.base_path,
            activo:activo
        },{transaction:t});
        await t.commit();
        return nuevo;
    } catch (error) {
        await t.rollback();
        return error;
    }
}

exports.actualizar = async(id, data) =>{
    const t = await dbConnection.transaction();
    try {
        if(data.activo){
            await Storage.update({activo:false},{where:{},transaction: t})
        }

        const actualizar = await Storage.update(data, {where:{storage_id:id},transaction:t});
        t.commit();
        return actualizar;
    } catch (error) {
        t.rollback();
        return error;
    }
}

exports.activo = async(id,estatus) =>{
    const t = await dbConnection.transaction();
    try {
        const activar = await Storage.update({activo:estatus},{where:{storage_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}