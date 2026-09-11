const {DataTypes} = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const EventoCurso = sequelize.define('EventoCurso',{
    evento_curso_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    titulo:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    actividad:{
        type:DataTypes.STRING(255),
        allowNull:true
    },
    fecha_inicio:{
        type: 'TIMESTAMP WITHOUT TIME ZONE',
        allowNull:false,
    },
    hora_inicio:{
        type: DataTypes.TIME,
        allowNull:false,
    },
    fecha_fin:{
        type: 'TIMESTAMP WITHOUT TIME ZONE',
        allowNull:false,
    },
    hora_fin:{
        type: DataTypes.TIME,
        allowNull:false,
    },
    orden:{
        type: DataTypes.INTEGER,
        allowNull:false,
    },
    activo:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
},
{
    tableName:'eventos_cursos',
}
);

module.exports = EventoCurso;