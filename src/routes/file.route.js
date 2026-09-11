const router = require('express').Router();
const fileCtrl = require('../controllers/fileController');
const {upload} = require('../middlewares/upload');


router.post('/upload',upload.array('files',15),fileCtrl.uploadFiles);

router.post('/:id/rename',fileCtrl.renameFile);

router.post('/:id/delete',fileCtrl.deleteFile);

router.get('/:id/download',fileCtrl.downloadFile);

module.exports = router;