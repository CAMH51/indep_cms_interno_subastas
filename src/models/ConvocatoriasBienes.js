const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const ConvocatoriaBienes = sequelize.define('ConvocatoriaBienes',{
    convocatoria_bien_id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true
    },
    nombre:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    url_documento:{
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