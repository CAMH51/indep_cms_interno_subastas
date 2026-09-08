const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const Sesion = sequelize.define('Sesion',{
    sesion_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    fk_usuario_id:{
        type:DataTypes.INTEGER,
        allowNull: false,
    },
    refresh_token_hash:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    csr_token:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    ip:{
        type:DataTypes.STRING(64),
        allowNull:true
    },
    user_agent:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    activa:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true,
    },
    ultimo_uso:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW
    },
    expira_en:{
        type:DataTypes.DATE,
        allowNull:false,
    }
},
{
    tableName:'sesiones',
}
);

module.exports = Sesion;