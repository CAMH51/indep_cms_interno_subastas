const router = require('express').Router();
const {renderListEntities} = require('../controllers/entityController');
const {verificarPermiso} = require('../middlewares/permisos');

//Metodos GET
router.get('/', verificarPermiso('dash'), renderListEntities);

module.exports = router;