const {File, Folder, FileVersion, Usuario} = require('../models');
const fs = require('fs');
const storageHelper = require('../utils/storageHelper');
const path = require('path');
const {v4: uuidv4} = require('uuid');

/**
 * Resuelve un usuario_id válido de la tabla local 'usuarios' para satisfacer la foreign key en 'file_versions'.
 * Si el usuario proviene de sesión externa/stateless (Keycloak / Control de Accesos) y su ID no existe en la BD local,
 * intenta buscarlo o crearlo por correo electrónico. Si falla o no hay usuario, devuelve null de forma segura.
 */
const resolveUsuarioId = async (usuario) => {
    if (!usuario) return null;

    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const candidateId = usuario.usuario_id || usuario.id || usuario.uid;

        // 1. Si candidateId tiene formato UUID válido, verificar si existe en la tabla local usuarios
        if (candidateId && typeof candidateId === 'string' && uuidRegex.test(candidateId)) {
            const userById = await Usuario.findByPk(candidateId);
            if (userById) return userById.usuario_id;
        }

        // 2. Si tiene email, buscar o sincronizar en la tabla local usuarios
        const email = usuario.email || usuario.mail;
        if (email && typeof email === 'string' && email.includes('@')) {
            const emailNormalizado = email.toLowerCase().trim();
            const [userByEmail] = await Usuario.findOrCreate({
                where: { email: emailNormalizado },
                defaults: {
                    email: emailNormalizado,
                    activo: true,
                    mfa: true
                }
            });
            if (userByEmail) return userByEmail.usuario_id;
        }
    } catch (err) {
        console.warn('Advertencia al asociar fk_usuario_id para FileVersion (se guardará sin autor):', err.message);
    }

    return null;
};

const uploadFiles = async (req, res, next) =>{
    try{
        const folderId = req.query.folderId || req.body.folderId || req.body.folder_id || null;
        const targetFolderId = folderId && folderId !== '' && folderId !== 'null' ? folderId : null;
        const isPublic = req.body.is_public === 'true' || req.body.is_public === true;

        if(!req.files || req.files.length === 0){
            return res.status(400).redirect(targetFolderId ? `/folders/${targetFolderId}` : '/documentos');
        }

        const usuarioIdValido = await resolveUsuarioId(req.usuario);

        for(const file of req.files){
            const newFile = await File.create({
                name: file.originalname,
                original_name: file.originalname,
                filename: file.filename,
                mime_type: file.mimetype,
                size: file.size,
                fk_folder_id: targetFolderId,
                fk_storage_id: req.storage.storage_id,
                is_public: isPublic
            });

            await FileVersion.create({
                fk_file_id: newFile.file_id,
                version_number: 1,
                filename: file.filename,
                original_name: file.originalname,
                size: file.size,
                mime_type: file.mimetype,
                comment: 'Versión inicial',
                fk_usuario_id: usuarioIdValido
            });
        }

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({ success: true, message: 'Archivos subidos exitosamente' });
        }
        res.redirect(targetFolderId ? `/folders/${targetFolderId}` : '/documentos');
    }catch(err){
        console.error('Error al subir archivos:', err);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(500).json({ success: false, message: err.message || 'Error al subir archivos' });
        }
        next(err);
    }
}

const uploadNewVersion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const uploadedFile = req.file; // multer single('file')

        if (!uploadedFile) {
            return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
        }

        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        // Obtener el número de la última versión
        const lastVersion = await FileVersion.max('version_number', {
            where: { fk_file_id: id }
        }) || 1;

        const nextVersion = lastVersion + 1;
        const usuarioIdValido = await resolveUsuarioId(req.usuario);

        // 1. Crear el nuevo registro histórico
        const version = await FileVersion.create({
            fk_file_id: file.file_id,
            version_number: nextVersion,
            filename: uploadedFile.filename,
            original_name: uploadedFile.originalname,
            size: uploadedFile.size,
            mime_type: uploadedFile.mimetype,
            comment: comment || `Actualización a versión ${nextVersion}`,
            fk_usuario_id: usuarioIdValido
        });

        // 2. Actualizar el archivo activo para que la URL pública (/raw/:code) entregue siempre la última versión
        file.filename = uploadedFile.filename;
        file.original_name = uploadedFile.originalname;
        file.size = uploadedFile.size;
        file.mime_type = uploadedFile.mimetype;
        await file.save();

        res.json({
            success: true,
            message: `Versión ${nextVersion} subida exitosamente`,
            version
        });
    } catch (err) {
        console.error('Error al subir nueva versión:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Error al subir la nueva versión'
        });
    }
};

const renameFile = async ( req, res, next) =>{
    try{
        const {id} = req.params;
        const {name} = req.body;

        const file = await File.findByPk(id);
        if(!file){
            return res.status(404).render('dashboard',{
                page:'error',
                title: 'Archivo no encontrado',
                message:'El archivo que intentas renombrar no existe.',
                statusCode:404
            });
        }

        const newName = name ? name.trim() : '';

        if(newName && newName !== file.name){
            // 1. Obtener la extensión original
            const ext = path.extname(file.filename);
            const cleanNewName = newName.replace(new RegExp(`\\${ext}$`, 'i'), '');
            // 2. Generar el nuevo nombre de archivo físico
            const safeBase = cleanNewName
                .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')
                .substring(0, 80);
            const newFilename = `${Date.now()}-${uuidv4().substring(0, 8)}-${safeBase}${ext}`;
            // 3. Renombrar físicamente en el disco
            const oldPath = await storageHelper.getFilePhysicalPath(file, req.storage);
            const folderDir = await storageHelper.getFolderPhysicalPath(file.fk_folder_id, req.storage);
            const newPath = path.join(folderDir, newFilename);
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
                console.log(`Archivo físico renombrado de ${oldPath} a ${newPath}`);
            }
            // 4. Actualizar en la base de datos
            file.name = cleanNewName;
            file.original_name = `${cleanNewName}${ext}`;
            file.filename = newFilename;
            await file.save();
        }

        res.redirect(file.fk_folder_id ? `/folders/${file.fk_folder_id}` : '/documentos');
    }catch(err){
        next(err);
    }
}

const deleteFile = async(req, res, next)=>{
    try{
        const {id} = req.params;
        const file = await File.findByPk(id);

        if(!file){
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
            }
            return res.status(404).render('dashboard',{
                page:'error',
                titulo: 'Archivo no encontrado',
                message:'El archivo que intentas eliminar no existe.',
                statusCode:404
            });
        }

        const redirectTarget = file.fk_folder_id ? `/folders/${file.fk_folder_id}` : '/documentos';

        const filePath = await storageHelper.getFilePhysicalPath(file, req.storage);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            console.log(`Archivo eliminado del disco: ${filePath}`);
        }

        await file.destroy();

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({ success: true, message: 'Archivo eliminado' });
        }
        res.redirect(redirectTarget);
    }catch(err){
        next(err);
    }
}

const downloadFile = async(req, res, next) =>{
    try{
        const {id} = req.params;
        const file = await File.findByPk(id);

        if(!file){
            return res.status(404).render('dashboard',{
                page:'error',
                title: 'Archivo no encontrado',
                message:'El archivo que intentas descargar no existe.',
                statusCode:404
            });
        }

        const filePath = await storageHelper.getFilePhysicalPath(file, req.storage);
        if(!fs.existsSync(filePath)){
            return res.status(404).render('dashboard',{
                page:'error',
                title: 'Archivo no encontrado',
                message:'El archivo que intentas descargar no existe en el servidor.',
                statusCode:404
            });
        }

        file.downloads_count += 1;
        await file.save();

        res.download(filePath, file.original_name);
    }catch(err){
        next(err);
    }
}

const toggleVisibility = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);
        if (!file) return res.status(404).json({ success: false, message: 'Archivo no encontrado' });

        file.is_public = !file.is_public;

        // Si se cambia a privado, invalidamos su public_code previo para revocar cualquier URL copiada anteriormente
        if (!file.is_public) {
            file.public_code = uuidv4();
        }

        await file.save();

        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const rawUrl = `${appUrl}/raw/${file.public_code}`;

        res.json({
            success: true,
            is_public: file.is_public,
            rawUrl,
            message: file.is_public ? 'El archivo ahora es público' : 'El archivo ahora es privado'
        });
    } catch (err) {
        next(err);
    }
};

const getFileVersions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        const versions = await FileVersion.findAll({
            where: { fk_file_id: id },
            include: [{ model: Usuario, as: 'usuario', attributes: ['usuario_id', 'email'], required: false }],
            order: [['version_number', 'DESC']]
        });

        res.json({
            success: true,
            file,
            versions
        });
    } catch (err) {
        next(err);
    }
};

const restoreVersion = async (req, res, next) => {
    try {
        const { id, versionId } = req.params;
        const file = await File.findByPk(id);
        const targetVersion = await FileVersion.findByPk(versionId);

        if (!file || !targetVersion) {
            return res.status(404).json({ success: false, message: 'Archivo o versión no encontrada' });
        }

        file.filename = targetVersion.filename;
        file.size = targetVersion.size;
        file.mime_type = targetVersion.mime_type;
        file.original_name = targetVersion.original_name;
        await file.save();

        res.json({
            success: true,
            message: `Restaurado a la versión ${targetVersion.version_number}`
        });
    } catch (err) {
        next(err);
    }
};

const downloadVersion = async (req, res, next) => {
    try {
        const { id, versionId } = req.params;
        const file = await File.findByPk(id);
        const targetVersion = await FileVersion.findByPk(versionId);

        if (!file || !targetVersion) {
            return res.status(404).send('Versión de archivo no encontrada');
        }

        const folderDir = await storageHelper.getFolderPhysicalPath(file.fk_folder_id, req.storage);
        const filePath = path.join(folderDir, targetVersion.filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('El archivo físico de esta versión no existe en el disco.');
        }

        res.download(filePath, targetVersion.original_name);
    } catch (err) {
        next(err);
    }
};

const getFilePreview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
        }

        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const previewUrl = `/files/${file.file_id}/stream`;

        res.json({
            success: true,
            file,
            previewUrl,
            appUrl
        });
    } catch (err) {
        next(err);
    }
};

const streamFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id);

        if (!file) {
            return res.status(404).send('Archivo no encontrado');
        }

        const folderDir = await storageHelper.getFolderPhysicalPath(file.fk_folder_id, req.storage);
        const filePath = path.join(folderDir, file.filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('El archivo físico no existe en el almacenamiento.');
        }

        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_name)}"`);
        res.setHeader('Cache-Control', 'private, no-cache');

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadFiles,
    renameFile,
    deleteFile,
    downloadFile,
    toggleVisibility,
    uploadNewVersion,
    getFileVersions,
    restoreVersion,
    downloadVersion,
    getFilePreview,
    streamFile
}