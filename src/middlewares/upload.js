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
      const destDir = await storageHelper.getFolderPhysicalPath(targetFolderId);

      // Asegurar que la carpeta física exista antes de guardar
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      cb(null, destDir);
    } catch (err) {
      console.error('Error al resolver la carpeta física de destino:', err);
      // Fallback a la carpeta base de uploads
      cb(null, storageHelper.getBaseStorageDir());
    }
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para evitar colisiones en disco
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const finalFilename = `${Date.now()}-${uniqueId.substring(0, 8)}-${safeBase}${ext}`;
    cb(null, finalFilename);
  },
});

// Limitar tamaño de archivo (50MB por defecto)
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
});

module.exports = {
  upload,
};
