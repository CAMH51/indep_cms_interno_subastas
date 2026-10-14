
const {Entity, Field} = require('../models');

exports.getAll = async() =>{
    const entities = await Entity.findAll(
        {
            include:[{model: Field, as: 'fields'}],
            order:[['name','ASC']]
        });
    return entities;
}

exports.getId = async(id) =>{
    const entity = await Entity.findOne(
        {
            where:{entity_id:id},
            include:[{model: Field, as: 'fields'}]
        });
    return entity;
}

exports.getName = async(name) =>{
    const entity = await Entity.findOne(
        {
            where:{name:name},
            include:[{model: Field, as: 'fields'}]
        });
    return entity;
}

exports.create  = async(data) =>{
    const entity = await Entity.create(
        data,
        {include:[{model:Field, as:'fields'}]}
    );

    return entity;
}

exports.update = async(id, data) => {
    const entity = await Entity.findOne({
        where: { entity_id: id },
        include: [{ model: Field, as: 'fields' }]
    });
    if (!entity) return null;

    if (data.name && data.name !== entity.name) {
        entity.name = data.name;
        await entity.save();
    }

    if (data.fields && Array.isArray(data.fields)) {
        await Field.destroy({ where: { fk_entity_id: entity.entity_id } });
        for (const f of data.fields) {
            await Field.create({
                name: f.name,
                label: f.label,
                type: f.type,
                length: f.length || null,
                scale: f.scale || null,
                unique: Boolean(f.unique),
                required: Boolean(f.required),
                activo: f.activo !== false,
                fk_entity_id: entity.entity_id
            });
        }
    }

    return await Entity.findOne({
        where: { entity_id: entity.entity_id },
        include: [{ model: Field, as: 'fields' }]
    });
};