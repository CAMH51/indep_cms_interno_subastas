const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Entity = sequelize.define('Entity',{
    entity_id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true
    },
    name: {
        type:DataTypes.STRING(50),
        allowNull:false,
        unique: true
    }
});

const Field = sequelize.define('Field',{
    field_id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true
    },
    name: {
        type:DataTypes.STRING(50),
        allowNull:false
    },
    label:{
        type:DataTypes.STRING(200),
        allowNull:false
    },
    type:{
        type:DataTypes.STRING(20),
        allowNull:false
    },
    length:{
        type:DataTypes.INTEGER
    },
    scale:{
        type:DataTypes.INTEGER
    },
    unique:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    required:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    activo:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
});


module.exports= {
    Entity,
    Field
}
