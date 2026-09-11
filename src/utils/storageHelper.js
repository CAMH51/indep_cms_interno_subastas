const path = require('path');
const fs = require('fs');


function getBaseStorageDir(){
    const uploadDirName = process.env.UPLOAD_DIR || 'uploads';
    const baseDir = path.resolve(__dirname, '../../', uploadDirName);
    if(!fs.existsSync(baseDir)){
        fs.mkdirSync(baseDir, {recursive:true});
    }
    return baseDir;
}

function sanitizeName(name){
    if(!name) return 'carpeta_sin_nombre';
    return name
        .trim()
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '')
        .substring(0,100);
}

async function getFolderPhysicalPath(folderId){
    const baseDir = getBaseStorageDir();
    if(!folderId || folderId === 'null' || folderId === ''){
        return baseDir;
    }

    const {Folder} = require('../models');
    const pathSegments = [];
    let currentId = folderId;

    while(currentId){
        const folder = await Folder.findByPk(currentId);
        if(!folder) break;
        pathSegments.unshift(sanitizeName(folder.name));
        currentId = folder.parent_id;
    }

    return path.join(baseDir, ...pathSegments);
}

async function getFilePhysicalPath(file){
    const folderDir = await getFolderPhysicalPath(file.folder_id);
    return path.join(folderDir, file.filename);
}

async function createPhysicalFolder(folderId){
    const physicalPath = await getFolderPhysicalPath(folderId);
    if(!fs.existsSync(physicalPath)){
        fs.mkdirSync(physicalPath, {recursive:true});
        console.log(`Carpeta física creada: ${physicalPath}`);
    }
    return physicalPath;
}

async function renamePhysicalFolder(folder, newName){
    const oldPath = await getFolderPhysicalPath(folder.folder_id);

    const parentPath = await getFolderPhysicalPath(folder.parent_id);
    const newPath = path.join(parentPath, sanitizeName(newName));

    if(oldPath === newPath) return;

    if(fs.existsSync(oldPath)){
        if(!fs.existsSync(newPath)){
            fs.renameSync(oldPath, newPath);
            console.log(`Carpeta física renombrada de ${oldPath} a ${newPath}`);
        }
    }else{
        fs.mkdirSync(newPath, {recursive:true});
    }
}

async function deletePhysicalFolder(folderId){
    const physicalPath = await getFolderPhysicalPath(folderId);
    if(fs.existsSync(physicalPath)){
        fs.rmSync(physicalPath, {recursive:true, force:true});
        console.log(`Carpeta física eliminada: ${physicalPath}`);
    }
}

module.exports = {
    getBaseStorageDir,
    sanitizeName,
    getFolderPhysicalPath,
    getFilePhysicalPath,
    createPhysicalFolder,
    renamePhysicalFolder,
    deletePhysicalFolder
}