const router = require('express').Router();
const fileCtrl = require('../controllers/fileController');
const {upload} = require('../middlewares/upload');


router.post('/upload',upload.array('files',15),fileCtrl.uploadFiles);

router.post('/:id/rename',fileCtrl.renameFile);

router.post('/:id/delete',fileCtrl.deleteFile);

router.get('/:id/download',fileCtrl.downloadFile);
router.get('/:id/preview', fileCtrl.getFilePreview);
router.get('/:id/stream', fileCtrl.streamFile);

router.post('/:id/toggle-visibility', fileCtrl.toggleVisibility);

// Rutas de versiones de archivo
router.get('/:id/versions', fileCtrl.getFileVersions);
router.post('/:id/versions', upload.single('file'), fileCtrl.uploadNewVersion);
router.post('/:id/versions/:versionId/restore', fileCtrl.restoreVersion);
router.get('/:id/versions/:versionId/download', fileCtrl.downloadVersion);

module.exports = router;