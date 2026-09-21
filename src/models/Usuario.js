const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Usuario = sequelize.define('Usuario',{
        usuario_id:{
            type:DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        email:{
            type:DataTypes.STRING(150),
            allowNull: false,
            unique:true,
            validate: {isEmail: true}
        },
        fk_rol_id:{
            type:DataTypes.UUID,
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