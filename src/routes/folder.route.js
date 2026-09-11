const router = require('express').Router();
const folderCtrl = require('../controllers/folderController');


router.get('/:folderId',folderCtrl.getExplorer);
router.post('/create', folderCtrl.createFolder);
router.post('/:id/update', folderCtrl.updateFolder);
router.post('/:id/delete', folderCtrl.deleteFolder);


module.exports = router;