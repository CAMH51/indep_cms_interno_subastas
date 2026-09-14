const router = require('express').Router();
const {body} = require('express-validator');

const rolCtrl = require('../controllers/rolController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');

const validacionRol = [
    body('nombre').trim().notEmpty().withMessage('El nombre del rol es obligatorio'),
];

router.get('/', verificarPermiso('roles.leer'), rolCtrl.listar);
router.get('/nuevo', verificarPermiso('roles.crear'), rolCtrl.formularioCrear);
router.post('/', verificarPermiso('roles.crear'), verificarCsrf, validacionRol, rolCtrl.crear);

router.get('/:rol/permisos', verificarPermiso('roles.leer'), rolCtrl.listarPermisosRol);

router.get('/:id/editar', verificarPermiso('roles.actualizar'), rolCtrl.formEditar);
router.post('/:id', verificarPermiso('roles.actualizar'), verificarCsrf, validacionRol, rolCtrl.actualizar);


router.get('/:id/permisos', verificarPermiso('roles.actualizar'), rolCtrl.formularioPermisos);
router.post('/:id/permisos', verificarPermiso('roles.actualizar'), verificarCsrf, rolCtrl.guardarPermisos);


module.exports = router;