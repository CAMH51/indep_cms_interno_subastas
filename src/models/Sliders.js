const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Slider = sequelize.define('Slider',{
    slider_id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true
    },
    titulo:{
        type:DataTypes.STRING(255),
        allowNull:false,
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
    activo:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
},
{
    tableName:'sliders',
    timestamps:true,
    scopes:{
        inactivos:{where:{activo:false}},
        activos:{where:{activo:true}},
        todos:{where:{}}
    }
}
);

module.exports = Slider;