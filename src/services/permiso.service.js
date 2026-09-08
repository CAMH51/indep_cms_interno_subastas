const {Permiso, Modulo} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.listar = async() =>{
    try {
        const permisos = await Permiso.findAll({include:{model:Modulo, as:'modulo'},order: [[{ model: Modulo, as: 'modulo' }, 'created_at', 'ASC']]});
        return permisos;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id) =>{
    try {
        const permiso = await Permiso.findOne({where:{permiso_id:id}});
        return permiso
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await Permiso.create(data,{transaction:t});
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
        const actualizar = await Permiso.update(data, {where:{permiso_id:id}},{transaction:t});
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
        const activar = await Permiso.update({activo:estatus},{where:{permiso_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}