const {ConvocatoriasBienes} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.getAll = async(tipo_bien, scope) =>{
    try {
        const convocatorias = scope ? await ConvocatoriasBienes.scope([scope]).findAll({where:{tipo_bien:tipo_bien}})
                        : await ConvocatoriasBienes.findAll({where:{tipo_bien:tipo_bien}});
        return convocatorias;
    } catch (error) {
        return error;
    }
}

exports.listar = async(tipo_bien) =>{
    try {
        const convocatorias = await ConvocatoriasBienes.findAll({where:{tipo_bien},order: [['createdAt', 'DESC']]});
        return convocatorias;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id, tipo_bien) =>{
    try {
        const convocatoria = await ConvocatoriasBienes.findOne({where:{convocatoria_bien_id:id,tipo_bien}});
        return convocatoria
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await ConvocatoriasBienes.create(data,{transaction:t});
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
        const actualizar = await ConvocatoriasBienes.update(data, {where:{convocatoria_bien_id:id}},{transaction:t});
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
        const activar = await ConvocatoriasBienes.update({activo:estatus},{where:{convocatoria_bien_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}