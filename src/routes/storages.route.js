const router = require('express').Router();
const {body} = require('express-validator');

const storageCtrl = require('../controllers/storagesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionStorages = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('base_path')
    .trim()
    .notEmpty()
    .withMessage('La ubicación es obligatoria')
];

router.get('/', verificarPermiso('storages.leer'),storageCtrl.listar);
router.get('/nuevo', verificarPermiso('storages.crear'), storageCtrl.formularioCrear);
router.post('/',verificarPermiso('storages.crear'), verificarCsrf, validacionStorages, storageCtrl.crear);

router.get('/:id/editar', verificarPermiso('storages.actualizar'), storageCtrl.formEditar);
router.post('/:id',verificarPermiso('storages.actualizar'), verificarCsrf, validacionStorages, storageCtrl.actualizar);

module.exports = router;