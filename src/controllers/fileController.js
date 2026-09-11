const {File, Folder} = require('../models');
const fs = require('fs');
const  storageHelper = require('../utils/storageHelper');

const uploadFiles = async (req, res, next) =>{
    try{
        const folderId = req.query.folderId || req.body.folder_id || null;
        const targetFolderId = folderId && folderId !== '' && folderId !== 'null' ? folderId : null;

        if(!req.files || req.files.length === 0){
            return res.status(400).redirect(targetFolderId ? `/folders/${targetFolderId}` : '/explorer');
        }

        for(const file of req.files){
            await File.create({
                name: file.originalname,
                original_name: file.originalname,
                filename: file.filename,
                mime_type: file.mimetype,
                size: file.size,
                folder_id: targetFolderId,
            });
        }
        res.redirect(targetFolderId ? `/folders/${targetFolderId}` : '/explorer');
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

        if(name && name.trim()){
            file.name = name.trim();
            await file.save();
        }

        res.redirect(file.folder_id ? `/folders/${file.folder_id}` : '/explorer');
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

        const redirectTarget = file.folderId ? `/folders/${file.folder_id}` : '/explorer';

        const filePath = storageHelper.getFilePhysicalPath(file);
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