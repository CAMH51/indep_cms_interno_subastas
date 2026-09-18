const {File} = require('../models');
const fs = require('fs');
const storageHelper = require('../utils/storageHelper');


const getPublicFileView = async(req, res, next) =>{
    try {
        const { code } = req.params;
        const file = await File.findOne({
            where:{public_code: code}
        });

        if(!file){
            return res.status(404).render('dashboard',{
                page:'error',
                title:'Archivo no encontrado',
                message:'El enlace permanente que buscas no existe o el archivo ha sido eliminado.',
                statusCode:404
            })
        }

        const appUrl = process.env.APP_URFL || `${req.protocol}://${req.get('host')}`;

/*         res.render('public-file',{
            title:`${file.name} - Enlace permanete`,
            file,
            appUrl
        }) */
       res.status(200).json({file,appUrl});
    } catch (error) {
        next(error)
    }
}

const getRawUrl = async(req, res, next)=>{
    try {
        const {code} = req.params;
        const file = await File.findOne({
            where:{public_code: code}
        });

        if(!file){
            return res.status(404).send('Archivo no encontrado')
        }

        const filePath = await storageHelper.getFilePhysicalPath(file, req.storage);
        if(!fs.existsSync(filePath)){
            return res.status(404).send('El archivo físico no existe en la ruta de almacenamiento.')
        }

        file.downloads_count += 1;
        await file.save();

        const forceDownload = req.query.download === '1';

        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader(
        'Content-Disposition',
        `${forceDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(file.original_name)}"`
        );
        res.setHeader('Cache-Control', 'public, max-age=86400');

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);

    } catch (error) {
        next(error)
    }
}

const directDownload = async(req, res, next) =>{
    try {
        const {code} = req.params;
        const file = await File.findOne({
            where:{public_code: code}
        });

        if(!file){
            return res.status(404).send('Archivo no encontrado')
        }

        const filePath = await storageHelper.getFilePhysicalPath(file);
        if(!fs.existsSync(filePath)){
            return res.status(404).send('Archivo no físico no encontrado')
        }

        file.downloadsCount +=  1;
        await file.save();

        res.download(filePath,file.original_name)
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublicFileView,
    getRawUrl,
    directDownload
}