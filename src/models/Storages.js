const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Storages = sequelize.define('Storages',{
    storage_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    name:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    base_path:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    activo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},
{
    tableName:'storages',
}
);

module.exports = Storages;