const router = require('express').Router();
const {body} = require('express-validator');

const menusLateralesCtrl = require('../controllers/menusLateralesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionMenusLaterales = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('texto').notEmpty().withMessage('El Texto es obligatorio'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
    body('ubicacion').notEmpty().withMessage('La ubicacion es obligatoria'),
];

router.get('/', verificarPermiso('menus_laterales.leer'),menusLateralesCtrl.listar);
router.get('/nuevo', verificarPermiso('menus_laterales.crear'), menusLateralesCtrl.formularioCrear);
router.post('/',verificarPermiso('menus_laterales.crear'), verificarCsrf, validacionMenusLaterales, menusLateralesCtrl.crear);

router.get('/:id/editar', verificarPermiso('menus_laterales.actualizar'), menusLateralesCtrl.formEditar);
router.post('/:id',verificarPermiso('menus_laterales.actualizar'), verificarCsrf, validacionMenusLaterales, menusLateralesCtrl.actualizar);

module.exports = router;