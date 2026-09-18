const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const MenuLateral = sequelize.define('MenuLateral',{
    menu_lateral_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    titulo:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    texto:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    url_imagen:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    link_informacion:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    orden:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    ubicacion:{
        type:DataTypes.STRING(10),
        defaultValue:0
    },
    activo:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
},
{
    tableName:'menus_laterales',
    timestamps:true,
    scopes:{
        inactivos:{where:{activo:false}},
        activos:{where:{activo:true}},
        todos:{where:{}}
    }
}
);

module.exports = MenuLateral;