const {MenusPrincipales} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.listar = async() =>{
    try {
        const menus = await MenusPrincipales.findAll({order: [['createdAt', 'DESC']]});
        return menus;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id) =>{
    try {
        const menu = await MenusPrincipales.findOne({where:{menu_principal_id:id}});
        return menu
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await MenusPrincipales.create(data,{transaction:t});
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
        const actualizar = await MenusPrincipales.update(data, {where:{menu_principal_id:id}},{transaction:t});
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
        const activar = await MenusPrincipales.update({activo:estatus},{where:{menu_principal_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}