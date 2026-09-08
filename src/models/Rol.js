const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Rol = sequelize.define('Rol',{
    rol_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    nombre:{
        type:DataTypes.STRING(100),
        allowNull: false,
        unique:true,
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    activo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true,
    }
},
{
    tableName:'roles',
    timestamps:true
}
);

module.exports = Rol;