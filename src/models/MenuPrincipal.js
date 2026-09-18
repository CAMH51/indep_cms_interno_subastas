const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const MenuPrincipal = sequelize.define('MenuPrincipal',{
    menu_principal_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    titulo:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    url:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    sitio_padre:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    icono:{
        type:DataTypes.STRING(10),
        allowNull:true
    },
    orden:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    activo:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
},
{
    tableName:'menus_principales',
    timestamps:true,
    scopes:{
        inactivos:{where:{activo:false}},
        activos:{where:{activo:true}},
        todos:{where:{}}
    }
}
);

module.exports = MenuPrincipal;