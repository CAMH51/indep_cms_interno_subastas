const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbPostrgres');

const FileVersion = sequelize.define('FileVersion', {
    version_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    fk_file_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre físico del archivo en el disco'
    },
    original_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    mime_type: {
        type: DataTypes.STRING(120),
        allowNull: true
    },
    comment: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Razón del cambio o notas de la versión'
    },
    fk_usuario_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Usuario que subió esta versión'
    }
}, {
    tableName: 'file_versions',
    timestamps: true
});

module.exports = FileVersion;
