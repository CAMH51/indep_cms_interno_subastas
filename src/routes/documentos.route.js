const router = require('express').Router();

const folderCtrl = require('../controllers/folderController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


router.get('/',verificarPermiso('REPDOC.read'),folderCtrl.getExplorer);

module.exports = router;