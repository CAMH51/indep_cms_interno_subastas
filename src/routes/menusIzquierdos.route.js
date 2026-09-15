const router = require('express').Router();
const {body} = require('express-validator');

const menusIzquierdoCtrl = require('../controllers/menusLateralesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionMenusLaterales = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('texto').notEmpty().withMessage('El Texto es obligatorio'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
    body('ubicacion').notEmpty().withMessage('La ubicacion es obligatoria'),
];

router.get('/', verificarPermiso('menus_izquierdos.leer'),menusIzquierdoCtrl.listarMenuIzquierdo);
router.get('/nuevo', verificarPermiso('menus_izquierdos.crear'), menusIzquierdoCtrl.formularioCrearMenuIzquierdo);
router.post('/',verificarPermiso('menus_izquierdos.crear'), verificarCsrf, validacionMenusLaterales, menusIzquierdoCtrl.crearMenuIzquierdo);

router.get('/:id/editar', verificarPermiso('menus_izquierdos.actualizar'), menusIzquierdoCtrl.formEditarMenuIzquierdo);
router.post('/:id',verificarPermiso('menus_izquierdos.actualizar'), verificarCsrf, validacionMenusLaterales, menusIzquierdoCtrl.actualizarMenuIzquierdo);

module.exports = router;