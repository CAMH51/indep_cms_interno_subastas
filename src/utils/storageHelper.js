const path = require('path');
const fs = require('fs');


function getBaseStorageDir(storage){
    console.log('storage',storage);
    const uploadDirName = storage.base_path || 'uploads';
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
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')
        .replace(/\.+$/, '')
        .substring(0,200);
}

async function getFolderPhysicalPath(folderId,storage){
    const baseDir = getBaseStorageDir(storage);
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

async function getFilePhysicalPath(file,storage){
    const folderDir = await getFolderPhysicalPath(file.fk_folder_id,storage);
    return path.join(folderDir, file.filename);
}

async function createPhysicalFolder(folderId,storage){
    const physicalPath = await getFolderPhysicalPath(folderId,storage);
    if(!fs.existsSync(physicalPath)){
        fs.mkdirSync(physicalPath, {recursive:true});
        console.log(`Carpeta física creada: ${physicalPath}`);
    }
    return physicalPath;
}

async function renamePhysicalFolder(folder, newName, storage){
    const oldPath = await getFolderPhysicalPath(folder.fk_folder_id, storage);

    const parentPath = await getFolderPhysicalPath(folder.parent_id, storage);
    const newPath = path.join(parentPath, sanitizeName(newName));

    if(oldPath === newPath) return;

    if(fs.existsSync(oldPath)){
            fs.renameSync(oldPath, newPath);
            console.log(`Carpeta física renombrada de ${oldPath} a ${newPath}`);
    }else{
        fs.mkdirSync(newPath, {recursive:true});
    }
}

async function deletePhysicalFolder(folderId, storage){
    const physicalPath = await getFolderPhysicalPath(folderId, storage);
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