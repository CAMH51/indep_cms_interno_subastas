const {Folder, File} = require('../models');
const storageHelper = require('../utils/storageHelper');


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
        let currentFolder = null;

        if(folderId){
            currentFolder = await Folder.findByPk(folderId);
            if(!currentFolder){
                return res.status(404).render('dashboard',{
                    page:'error',
                    title: 'Carpeta no encontrada',
                    message:'La carpeta que intentas acceder no existe.',   
                    statusCode:404
                });
            }
            await storageHelper.createPhysicalFolder(folderId);
        }

        const subfolders = await Folder.findAll({
            where:{parent_id:folderId},
            order:[['name','ASC']],
            include:[
                {model:Folder, as:'subfolders', attributes:['folder_id']},
                {model:File, as:'files', attributes:['file_id', 'size']}
            ]
        });

        const files = await File.findAll({
            where: {folder_id:folderId},
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
            return res.status(400).redirect(parent_id ? `/folders/${parent_id}` : '/explorer');
        }

        const newFolder = await Folder.create({
            name:name.trim(),
            parent_id:parent_id || null,
            color: color || 'indigo',
        });

        await storageHelper.createPhysicalFolder(newFolder.folder_id);

        res.redirect(parent_id ? `/folders/${parent_id}` : '/explorer')
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

        if(name && name.trim()  && name.trim() !== folder.name){
            await storageHelper.renamePhysicalFolder(folder,name.trim());

            folder.name = name.trim();
        }

        if(color) folder.color = color;

        await folder.save();

        res.redirect(folder.parent_id ? `/folders/${folder.parent_id}` : '/explorer');
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

        const redirectTarget = folder.parent_id ? `/folders/${folder.parent_id}` :'/explorer';

        await storageHelper.deletePhysicalFolder(folder.folder_id);

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