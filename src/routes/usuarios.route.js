const router = require('express').Router();
const {body} = require('express-validator');

const usuarioCtrl = require('../controllers/usuarioController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionUsuario = () => [
    body('email').isEmail().withMessage('Correo invalido'),
    body('fk_rol_id').notEmpty().withMessage('Debes seleccionar un rol'),
];

router.get('/',verificarPermiso('usuarios.leer'), usuarioCtrl.listar);
router.get('/nuevo', verificarPermiso('usuarios.crear'), usuarioCtrl.formularioCrear);
router.post('/', verificarPermiso('usuarios.crear'), verificarCsrf, validacionUsuario, usuarioCtrl.crear);
router.get('/:id/editar', verificarPermiso('usuarios.actualizar'), usuarioCtrl.formEditar);
router.post('/:id', verificarPermiso('usuarios.actualizar'), verificarCsrf, validacionUsuario, usuarioCtrl.actualizar);

module.exports = router;