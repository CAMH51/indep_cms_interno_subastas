const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Usuario = sequelize.define('Usuario',{
        usuario_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey: true
        },
        email:{
            type:DataTypes.STRING(150),
            allowNull: false,
            unique:true,
            validate: {isEmail: true}
        },
        intentos_fallidos:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        bloqueado_hasta:{
            type:DataTypes.DATE,
            allowNull:true
        },
        fk_rol_id:{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
        activo:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true
        },
        mfa:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true
        }
    },
    {
        tableName:'usuarios',
        timestamps:true
    }
);

module.exports = Usuario;