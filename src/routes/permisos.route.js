const router = require('express').Router();
const {body} = require('express-validator');

const permisoCtrl = require('../controllers/permisoController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');

const validacionPermiso = [
    body('modulos').notEmpty().withMessage('Debe selecciónar un módulo'),
    body('accion').isIn(['crear', 'leer', 'actualizar']).withMessage('Acción invalida'),
];

router.get('/', verificarPermiso('permisos.leer'), permisoCtrl.listar);
router.get('/nuevo',verificarPermiso('permisos.crear'), permisoCtrl.formularioCrear);
router.post('/', verificarPermiso('permisos.crear'), verificarCsrf, validacionPermiso, permisoCtrl.crear);

module.exports = router;