const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Permiso = sequelize.define('Permiso',{
    permiso_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    accion:{
        type:DataTypes.ENUM('crear','leer','actualizar','eliminar'),
        allowNull: false
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    fk_modulo_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
    }
},
{
    tableName:'permisos',
    indexes:[
        {unique:true, fields:['fk_modulo_id','accion']},
    ]
}
);

module.exports = Permiso;