const router = require('express').Router();
const {body} = require('express-validator');

const menusDerechoCtrl = require('../controllers/menusLateralesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionMenusLaterales = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('texto').notEmpty().withMessage('El Texto es obligatorio'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
    body('ubicacion').notEmpty().withMessage('La ubicacion es obligatoria'),
];

router.get('/', verificarPermiso('menus_derechos.leer'),menusDerechoCtrl.listarMenuDerecho);
router.get('/nuevo', verificarPermiso('menus_derechos.crear'), menusDerechoCtrl.formularioCrearMenuDerecho);
router.post('/',verificarPermiso('menus_derechos.crear'), verificarCsrf, validacionMenusLaterales, menusDerechoCtrl.crearMenuDerecho);

router.get('/:id/editar', verificarPermiso('menus_derechos.actualizar'), menusDerechoCtrl.formEditarMenuDerecho);
router.post('/:id',verificarPermiso('menus_derechos.actualizar'), verificarCsrf, validacionMenusLaterales, menusDerechoCtrl.actualizarMenuDerecho);

module.exports = router;