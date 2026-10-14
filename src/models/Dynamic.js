const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const IDENT = /^[a-z][a-z0-9_]{0,49}$/;

const TYPE_MAP = {
    string: (f) => DataTypes.STRING(f.length || 255),
    text: () => DataTypes.TEXT,
    integer: () => DataTypes.INTEGER,
    bigint: () => DataTypes.BIGINT,
    decimal: (f) => DataTypes.DECIMAL(f.length || 10, f.scale || 2),
    boolean: () => DataTypes.BOOLEAN,
    date: () => DataTypes.DATE,
    dateonly: () => DataTypes.DATEONLY,
    time: () => DataTypes.TIME
};

const registry = new Map();

function validateDefinition(name, fields){
    if(!IDENT.test(name)) throw new Error(`Nombre de la libreria inválido: ${name}`);
    if(!Array.isArray(fields) || fields.length === 0)
        throw new Error('Debe definir al menos un campo');

    const seen = new Set();
    for(const f of fields){
        if(!IDENT.test(f.name)) throw new Error(`Nombre de campo inválido: ${f.name}`);
        if(seen.has(f.name)) throw new Error(`Campo repetido: ${f.name}`);
        if(!TYPE_MAP[f.type]) throw new Error(`Tipo no soportado: ${f.type}`);

        seen.add(f.name);
    }
}

function buildModel(entity){
    const attributes = {};
    for (const f of entity.fields) {
        attributes[f.name] = {
            type: TYPE_MAP[f.type](f),
            allowNull: !f.required,
            unique: Boolean(f.unique),
            defaultValue: f.name.toLowerCase() === 'activo' ? true : (f.defaultValue !== undefined && f.defaultValue !== null && f.defaultValue !== '' ? f.defaultValue : undefined)
        };
    }

    const tableName = `lib_${entity.name}`;
    const model = sequelize.define(tableName,attributes,{
        tableName,
        freezeTableName:true
    });

    registry.set(entity.name,model);

    return model;
}

module.exports = {buildModel,validateDefinition, registry};