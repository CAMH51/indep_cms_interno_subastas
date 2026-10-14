const path = require('path');
const {File, FileVersion} = require('../models');
const fs = require('fs');
const storageHelper = require('../utils/storageHelper');
const {verificarAccessToken} = require('../utils/jws');

function userSession(req){
    const token = req.cookies?.accessToken;

    if(!token) return false;

    try {
        verificarAccessToken(token);
        return true;
    } catch (error) {
        return false;
    }
}


const getPublicFileView = async(req, res, next) =>{
    try {
        const { code } = req.params;
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const file = await File.findOne({
            where:{public_code: code}
        });

        if(!file){
            return res.status(404).render('dashboard',{
                page:'error',
                title:'Archivo no encontrado',
                message:'El enlace permanente que buscas no existe o el archivo ha sido eliminado.',
                statusCode:404
            });
        }

        if(!file.is_public){
            return res.status(403).json({
                success: false,
                message: 'Este archivo es privado. Su enlace público está deshabilitado.'
            });
        }

        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

        res.status(200).json({file, appUrl});
    } catch (error) {
        next(error)
    }
}

const getRawUrl = async(req, res, next)=>{
    try {
        const {code} = req.params;
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        const file = await File.findOne({
            where:{public_code: code}
        });

        if(!file){
            return res.status(404).send('Archivo no encontrado');
        }

        if(!file.is_public){
            return res.status(403).send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Archivo Privado</title>
    <link rel="stylesheet" href="/styles/output.css">
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-200">
        <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
        </div>
        <h1 class="text-xl font-bold text-gray-800 mb-2">Archivo Privado</h1>
        <p class="text-sm text-gray-600 mb-6">Este archivo está configurado como privado. Su enlace público está deshabilitado.</p>
        <a href="/login" class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow">
            Acceder al CMS
        </a>
    </div>
</body>
</html>
            `);
        }

        let targetFilename = file.filename;
        let targetOriginalName = file.original_name;
        let targetMimeType = file.mime_type;

        if(req.query.v){
            const version = await FileVersion.findOne({
                where:{
                    fk_file_id: file.file_id,
                    version_number: parseInt(req.query.v, 10)
                }
            });
            if(version){
                targetFilename = version.filename;
                targetOriginalName = version.original_name;
                targetMimeType = version.mime_type;
            }
        }

        const folderDir = await storageHelper.getFolderPhysicalPath(file.fk_folder_id, req.storage);
        const filePath = path.join(folderDir, targetFilename);

        if(!fs.existsSync(filePath)){
            return res.status(404).send('El archivo físico no existe en la ruta de almacenamiento.');
        }

        file.downloads_count += 1;
        await file.save();

        const forceDownload = req.query.download === '1';

        res.setHeader('Content-Type', targetMimeType || 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            `${forceDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(targetOriginalName)}"`
        );

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);

    } catch (error) {
        next(error)
    }
}

const directDownload = async(req, res, next) =>{
    try {
        const {code} = req.params;
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const file = await File.findOne({
            where:{public_code: code}
        });

        if(!file){
            return res.status(404).send('Archivo no encontrado');
        }

        if(!file.is_public){
            return res.status(403).send('Este archivo es privado y no permite descarga pública directa.');
        }

        let targetFilename = file.filename;
        let targetOriginalName = file.original_name;

        if(req.query.v){
            const version = await FileVersion.findOne({
                where:{
                    fk_file_id: file.file_id,
                    version_number: parseInt(req.query.v, 10)
                }
            });
            if(version){
                targetFilename = version.filename;
                targetOriginalName = version.original_name;
            }
        }

        const folderDir = await storageHelper.getFolderPhysicalPath(file.fk_folder_id, req.storage);
        const filePath = path.join(folderDir, targetFilename);

        if(!fs.existsSync(filePath)){
            return res.status(404).send('Archivo físico no encontrado');
        }

        file.downloads_count += 1;
        await file.save();

        res.download(filePath, targetOriginalName);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublicFileView,
    getRawUrl,
    directDownload
}