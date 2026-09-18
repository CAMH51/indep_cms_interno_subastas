const {Slider} = require('../models');
const dbConnection = require('../config/dbPostrgres');

exports.getAll = async(scope,whereOption={}) =>{
    try {
        const sliders = scope ? await Slider.scope([scope]).findAll(whereOption)
                        : await Slider.findAll(whereOption);

        return sliders;
    } catch (error) {
        return error;
    }
}

exports.listar = async() =>{
    try {
        const sliders = await Slider.findAll({order: [['createdAt', 'DESC']]});
        return sliders;
        
    } catch (error) {
        return error;
    }
}

exports.obtenerPorId = async(id) =>{
    try {
        const slider = await Slider.findOne({where:{slider_id:id}});
        return slider
    } catch (error) {
        return error;
    }
}

exports.crear = async(data) =>{
    const t = await dbConnection.transaction();
    try {
        const nuevo = await Slider.create(data,{transaction:t});
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
        const actualizar = await Slider.update(data, {where:{slider_id:id}},{transaction:t});
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
        const activar = await Slider.update({activo:estatus},{where:{slider_id:id}},{transaction:t});
        t.commit();
        return activar;
    } catch (error) {
        t.rollback();
        return error;
    }
}