const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Folder = sequelize.define('Folder',{
    folder_id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING(255),
        allowNull:false,
        validate:{
            notEmpty:{msg:'el nombre de la carpeta no puede estar vacío'},
            len:{args:[1,255], msg:'El nombre debe tener entre 1 y 255 caracteres'}
        }
    },
    parent_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    fk_storage_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    color:{
        type:DataTypes.STRING(20),
        defaultValue:'#000000'
    },
},
{
    tableName:'folders',
    timestamps:true
}
);

module.exports = Folder;