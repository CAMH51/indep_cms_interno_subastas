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

router.get('/', verificarPermiso('UNIALM.leer'),storageCtrl.listar);
router.get('/nuevo', verificarPermiso('UNIALM.crear'), storageCtrl.formularioCrear);
router.post('/',verificarPermiso('UNIALM.crear'), verificarCsrf, validacionStorages, storageCtrl.crear);

router.get('/:id/editar', verificarPermiso('UNIALM.actualizar'), storageCtrl.formEditar);
router.post('/:id',verificarPermiso('UNIALM.actualizar'), verificarCsrf, validacionStorages, storageCtrl.actualizar);

module.exports = router;