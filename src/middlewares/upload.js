const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const storageHelper = require('../utils/storageHelper');

// Configuración de almacenamiento dinámico en disco con Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Obtener el ID de la carpeta desde query params o body
      const folderId = req.query.folderId || req.body.folderId || null;
      const targetFolderId = folderId && folderId !== '' && folderId !== 'null' ? folderId : null;

      // Obtener la ruta física absoluta de la carpeta en disco
      const destDir = await storageHelper.getFolderPhysicalPath(targetFolderId,req.storage);

      // Asegurar que la carpeta física exista antes de guardar
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      cb(null, destDir);
    } catch (err) {
      console.error('Error al resolver la carpeta física de destino:', err);
      // Fallback a la carpeta base de uploads
      cb(null, storageHelper.getBaseStorageDir(req.storage));
    }
  },
  filename: (req, file, cb) => {

    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    file.originalname = originalName;
    // Generar un nombre único para evitar colisiones en disco
    const uniqueId = uuidv4().substring(0,8);
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);
    const safeBase = base
      .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')
      .substring(0, 80);
    const finalFilename = `${Date.now()}-${uniqueId}-${safeBase}${ext}`;
    cb(null, finalFilename);
  },
});

const fileFilter = (req, file, cb) =>{
  const type = req.query.type || req.body.type;

  if(type === 'image'){
    if(!file.mimetypr.startsWith('image/')){
      return cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF, SVG)'));
    }
  }
  cb(null, true);
}

// Limitar tamaño de archivo (50MB por defecto)
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter
});

module.exports = {
  upload,
};
