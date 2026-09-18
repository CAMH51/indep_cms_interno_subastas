const {File, Folder} = require('../models');
const fs = require('fs');
const  storageHelper = require('../utils/storageHelper');
const path = require('path');
const {v4: uuidv4} = require('uuid');

const uploadFiles = async (req, res, next) =>{
    try{
        const folderId = req.query.folderId || req.body.folder_id || null;
        const targetFolderId = folderId && folderId !== '' && folderId !== 'null' ? folderId : null;

        if(!req.files || req.files.length === 0){
            return res.status(400).redirect(targetFolderId ? `/folders/${targetFolderId}` : '/documentos');
        }

        for(const file of req.files){
            await File.create({
                name: file.originalname,
                original_name: file.originalname,
                filename: file.filename,
                mime_type: file.mimetype,
                size: file.size,
                fk_folder_id: targetFolderId,
                fk_storage_id:req.storage.storage_id
            });
        }
        res.redirect(targetFolderId ? `/folders/${targetFolderId}` : '/documentos');
    }catch(err){
        next(err);
    }
}

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
            })
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
            file.original_name = `${cleanNewName}${ext}`; // ✅ No conserva el nombre original anterior
            file.filename = newFilename;                  // ✅ Sincronizado con el disco
            // ✅ Guarda cambios y actualiza automáticamente la fecha en updatedAt
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
            return res.status(404).render('dashboard',{
                page:'error',
                titulo: 'Archivo no encontrado',
                message:'El archivo que intentas eliminar no existe.',
                statusCode:404
            });
        }

        const redirectTarget = file.fk_folder_id ? `/folders/${file._fk_folder_id}` : '/documentos';

        const filePath = storageHelper.getFilePhysicalPath(file, req.storage);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            console.log(`Archivo eliminado del disco: ${filePath}`);
        }

        await file.destroy();
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

        const filePath = storageHelper.getFilePhysicalPath(file);
        if(!fs.existsSync(filePath)){
            return res.status(404).render('dashboard',{
                page:'error',
                title: 'Archivo no encontrado',
                message:'El archivo que intentas descargar no existe en el servidor.',
                statusCode:404
            });
        }

        file.download_count += 1;
        await file.save();

        res.download(filePath, file.original_name);
    }catch(err){
        next(err);
    }
}

module.exports = {
    uploadFiles,
    renameFile,
    deleteFile,
    downloadFile
}