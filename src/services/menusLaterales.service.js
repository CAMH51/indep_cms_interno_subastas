const {MenusLaterales} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.getAll = async(ubicacion, scope) =>{
    try {
        const menus = scope ? await MenusLaterales.scope([scope]).findAll({where:{ubicacion:ubicacion}})
                        : await MenusLaterales.findAll({where:{ubicacion:ubicacion}});
        return menus;
    } catch (error) {
        return error;
    }
}

exports.listar = async(ubicacion) =>{
    try {
        const menus = await MenusLaterales.findAll({where:{ubicacion},order: [['createdAt', 'DESC']]});
        return menus;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id, ubicacion) =>{
    try {
        const menu = await MenusLaterales.findOne({where:{menu_lateral_id:id,ubicacion}});
        return menu
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await MenusLaterales.create(data,{transaction:t});
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
        const actualizar = await MenusLaterales.update(data, {where:{menu_lateral_id:id}},{transaction:t});
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
        const activar = await MenusLaterales.update({activo:estatus},{where:{menu_lateral_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}