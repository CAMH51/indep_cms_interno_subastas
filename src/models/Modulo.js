const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Modulo = sequelize.define('Modulo',{
    modulo_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nombre:{
        type:DataTypes.STRING(100),
        allowNull: false
    },
    slug:{
        type:DataTypes.STRING(80),
        allowNull:false,
        unique:true,
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    icono:{
        type:DataTypes.STRING(60),
        allowNull:true,
        defaultValue:''
    },
    orden:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0,
    },
    activo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},
{
    tableName:'modulos'
}
);

module.exports = Modulo;