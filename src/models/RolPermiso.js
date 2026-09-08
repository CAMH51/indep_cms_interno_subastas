const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const RolPermiso = sequelize.define('RolPermiso',{
    fk_rol_id:{
        type:DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true,
    },
    fk_permiso_id:{
        type:DataTypes.INTEGER,
        allowNull: false,
        primaryKey:true,
    },
},
{
    tableName:'roles_permisos',
}
);

module.exports = RolPermiso;