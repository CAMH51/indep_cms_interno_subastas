const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbPostrgres');
const { v4: uuidv4 } = require('uuid');

const File = sequelize.define('File', {
    file_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre de visualización o título del archivo',
    },
    original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre original del archivo',
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre del archivo en el storage',
    },
    mime_type: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'Tipo de MIME del archivo',
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Tamaño del archivo',
    },
    public_code: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: () => uuidv4(),
        comment: 'Código público para acceder al archivo',
    },
    folder_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    downloads_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // CAMPOS VIRTUALES (Se serializan automáticamente en res.json)
    formattedSize: {
        type: DataTypes.VIRTUAL,
        get() {
            const bytes = Number(this.size) || 0;
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    },
    fileCategory: {
        type: DataTypes.VIRTUAL,
        get() {
            const mime = (this.mime_type || '').toLowerCase();
            const ext = (this.original_name || '').split('.').pop().toLowerCase();

            if (mime.startsWith('image/')) return 'image';
            if (mime === 'application/pdf') return 'pdf';
            if (mime.startsWith('video/')) return 'video';   
            if (mime.startsWith('audio/')) return 'audio';
            if (
                mime.includes('zip') ||
                mime.includes('rar') ||
                mime.includes('tar') ||
                mime.includes('7z') ||
                ['zip', 'rar', 'tar', '7z'].includes(ext)
            )
                return 'archive';
            
            if (
                mime.includes('json') ||
                mime.includes('javascript') ||
                mime.includes('typescript') ||
                mime.includes('html') ||
                mime.includes('css') ||
                mime.includes('text/') ||
                ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'sql', 'md', 'txt'].includes(ext)
            )
                return 'code';

            if (
                mime.includes('word')||
                ['doc', 'docx'].includes(ext)
            ) 
            return 'word';

            if (
                mime.includes('powerpoint')||
                ['ppt', 'pptx'].includes(ext)
            ) 
            return 'powerpoint';

            if (
                mime.includes('excel')||
                ['xls', 'xlsx'].includes(ext)
            ) 
            return 'excel';

            if (
                mime.includes('word') ||
                mime.includes('officedocument') ||
                ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)
            )
                return 'document';

            return 'other';
        }
    },
    permanentUrl: {
        type: DataTypes.VIRTUAL,
        get() {
            const baseUrl = process.env.APP_URL || 'http://localhost:3000';
            return `${baseUrl}/f/${this.public_code}`;
        }
    },
    rawUrl: {
        type: DataTypes.VIRTUAL,
        get() {
            const baseUrl = process.env.APP_URL || 'http://localhost:3000';
            return `${baseUrl}/raw/${this.public_code}`;
        }
    }
}, {
    tableName: 'files',
    timestamps: true
});

module.exports = File;
