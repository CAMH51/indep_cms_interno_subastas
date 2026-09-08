const {Rol} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.listar = async() =>{
    try {
        const roles = await Rol.findAll({order: [['createdAt', 'DESC']]});
        return roles;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id) =>{
    try {
        const rol = await Rol.findOne({where:{rol_id:id}});
        return rol
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await Rol.create(data,{transaction:t});
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
        const actualizar = await Rol.update(data, {where:{rol_id:id}},{transaction:t});
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
        const activar = await Rol.update({activo:estatus},{where:{rol_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}