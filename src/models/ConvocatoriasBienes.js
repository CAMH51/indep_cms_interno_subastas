const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const ConvocatoriaBienes = sequelize.define('ConvocatoriaBienes',{
    convocatoria_bien_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    texto:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    tipo_bien:{
        type: DataTypes.STRING(10),
        allowNull:false,
    },
    activo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},
{
    tableName:'convocatorias_bienes',
}
);

module.exports = ConvocatoriaBienes;