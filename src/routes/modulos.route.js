const router = require('express').Router();
const {body} = require('express-validator');

const moduloCtrl = require('../controllers/moduloController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionModulo = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('slug')
    .trim()
    .notEmpty()
    .withMessage('El identificador (slug) es obligatorio')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('El slug solo puede contener minusculas, números, guiones y guión bajo'),
];

router.get('/', verificarPermiso('modulos.leer'),moduloCtrl.listar);
router.get('/nuevo', verificarPermiso('modulos.crear'), moduloCtrl.formularioCrear);
router.post('/',verificarPermiso('modulos.crear'), verificarCsrf, validacionModulo, moduloCtrl.crear);

router.get('/:id/editar', verificarPermiso('modulos.actualizar'), moduloCtrl.formEditar);
router.post('/:id',verificarPermiso('modulos.actualizar'), verificarCsrf, validacionModulo, moduloCtrl.actualizar);

module.exports = router;