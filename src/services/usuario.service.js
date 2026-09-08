const {Usuario, Rol, Sesion} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.listar = async() =>{
    try {
        const usuarios = await Usuario.findAll({include:{model:Rol, as:'rol'},order: [['created_at','ASC']]});
        return usuarios;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id) =>{
    try {
        const usuario = await Usuario.findOne({where:{usuario_id:id}});
        return usuario
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await Usuario.create(data,{transaction:t});
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
        const actualizar = await Usuario.update(data, {where:{usuario_id:id}},{transaction:t});
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
        const activar = await Usuario.update({activo:estatus},{where:{usuario_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}