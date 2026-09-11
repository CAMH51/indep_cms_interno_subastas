const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Archivos = sequelize.define('Archivos',{
    archivo_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    nombre_archivo:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    nombre_original:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    ext_archivo:{
        type:DataTypes.STRING(100),
        allowNull:true
    },
    tamanio_archivo:{
        type:DataTypes.BIGINT,
        allowNull:true
    },
    ruta_archivo:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    fk_storage_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    fk_usuario_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    activo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},
{
    tableName:'archivos',
}
);

module.exports = Archivos;