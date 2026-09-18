const {Folder, File} = require('../models');
const storageHelper = require('../utils/storageHelper');
const {formatearFecha} = require('../utils/formatearFecha');
const {Op} = require('sequelize');


async function getBreadcrumbs(folderId){
    const crumbs = [{id: null, name:'Raiz'}];
    if(!folderId) return crumbs;

    let currentId = folderId;
    const chain = [];

    while(currentId){
        const folder = await Folder.findByPk(currentId);
        if(!folder) break;
        chain.unshift({id:folder.folder_id, name:folder.name});
        currentId = folder.parent_id;
    }

    return [...crumbs, ...chain];
}


const getExplorer = async(req, res, next) =>{
    try{
        const folderId = req.params.folderId || null;
        const currentStorageId = req.storage.storage_id;
        let currentFolder = null;

        const mode = req.query.mode || null;
        const type = req.query.type  || null;
        const targetInput = req.query.targetInput || 'url_imagen';

        const fileWhere = {
            fk_folder_id: folderId,
            fk_storage_id:currentStorageId
        }

        if(type === 'image'){
            fileWhere.mime_type = { [Op.like]: 'image/%'}
        }


        if(folderId){
            currentFolder = await Folder.findByPk(folderId,{
                where:{
                    forder_id:folderId,
                    fk_storage_id:currentStorageId
                }
            });

            if(!currentFolder){
                return res.status(404).render('dashboard',{
                    page:'error',
                    title: 'Carpeta no encontrada',
                    message:'La carpeta que intentas acceder no existe.',   
                    statusCode:404
                });
            }
            await storageHelper.createPhysicalFolder(folderId, req.storage);
        }

        const subfolders = await Folder.findAll({
            where:{
                parent_id:folderId,
                fk_storage_id:currentStorageId
            },
            order:[['name','ASC']],
            include:[
                {
                    model:Folder, 
                    as:'subfolders', 
                    attributes:['folder_id'],
                    where:{fk_storage_id:currentStorageId},
                    required:false
                },
                {
                    model:File, 
                    as:'files', 
                    attributes:['file_id', 'size'],
                    where:{fk_storage_id:currentStorageId},
                    required:false
                }
            ]
        });

        const files = await File.findAll({
            where: fileWhere,
            order:[['createdAt','DESC']]
        });

        const breadcrumbs = await getBreadcrumbs(folderId);

        let totalSize = 0;
        files.forEach((f)=>{
            totalSize += Number(f.size) || 0
        });

        const formatBytes = (bytes) =>{
            if(bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i];
        }

        res.render('dashboard',{
            page:'explorer',
            titulo: currentFolder ? `${currentFolder.name} - Directorios` : 'Mi Unidad - Directorios',
            currentFolder,
            folderId,
            breadcrumbs,
            subfolders,
            files,
            formatearFecha,
            picker:{
                mode,
                type,
                targetInput
            },
            stats:{
                folderCount:subfolders.length,
                fileCount: files.length,
                formattedTotalSize: formatBytes(totalSize)
            },
            appUrl: process.env.APP_URL || `${req.protocol}://${req.get('host')}`
        })
    }catch(err){
        next(err);
    }
}

const createFolder = async(req, res, next)=>{
    try {
        const {name, parent_id, color} = req.body;
        if(!name || !name.trim()){
            return res.status(400).redirect(parent_id ? `/folders/${parent_id}` : '/documentos');
        }

        const newFolder = await Folder.create({
            name:name.trim(),
            parent_id:parent_id || null,
            color: color || 'indigo',
            fk_storage_id: req.storage.storage_id
        });

        await storageHelper.createPhysicalFolder(newFolder.folder_id, req.storage);

        res.redirect(parent_id ? `/folders/${parent_id}` : '/documentos')
    } catch (error) {
        next(error);
    }
}

const updateFolder = async(req, res, next)=>{
    try {
        const {id} = req.params;
        const {name, color} = req. body;
        const folder = await Folder.findByPk(id);

        if(!folder){
            return res.status(404).render('dashboard',{
                page:'error',
                title:'Carpeta no encontrada',
                message:'No se encontró la carpeta para actualizar.',
                statusCode:404
            });
        }

        const newName = name ? name.trim() : '';

        if(newName && newName !== folder.name){
            await storageHelper.renamePhysicalFolder(folder.folder_id,folder.name.trim(), req.storage);

            folder.name = newName;
        }

        if(color) folder.color = color;

        await folder.save();

        res.redirect(folder.parent_id ? `/folders/${folder.parent_id}` : '/documentos');
    } catch (error) {
        next(error);
    }
}


const deleteFolder = async(req, res, next) =>{
    try {
        const {id} = req.params;
        const folder = await Folder.findByPk(id);

        if(!folder){
            return res.status(404).render('dashboard',{
                page:'error',
                title:'Carpeta no encontrada',
                message:'No se encontró la carpeta para actualizar.',
                statusCode:404
            });
        }

        const redirectTarget = folder.parent_id ? `/folders/${folder.parent_id}` :'/documentos';

        await storageHelper.deletePhysicalFolder(folder.folder_id, req.storage);

        await folder.destroy();

        res.redirect(redirectTarget);
    } catch (error) {
        next(error)
    }
}


module.exports = {
    getExplorer,
    createFolder,
    updateFolder,
    deleteFolder
}