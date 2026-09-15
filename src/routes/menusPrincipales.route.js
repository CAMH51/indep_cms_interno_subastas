const router = require('express').Router();
const {body} = require('express-validator');

const menusPrincipalCtrl = require('../controllers/MenusPrincipalesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionMenusPrincipales = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('url').notEmpty().withMessage('La url es obligatoria'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
];

router.get('/', verificarPermiso('menus_izquierdos.leer'),menusPrincipalCtrl.listar);
router.get('/nuevo', verificarPermiso('menus_izquierdos.crear'), menusPrincipalCtrl.formularioCrear);
router.post('/',verificarPermiso('menus_izquierdos.crear'), verificarCsrf, validacionMenusPrincipales, menusPrincipalCtrl.crear);

router.get('/:id/editar', verificarPermiso('menus_izquierdos.actualizar'), menusPrincipalCtrl.formEditar);
router.post('/:id',verificarPermiso('menus_izquierdos.actualizar'), verificarCsrf, validacionMenusPrincipales, menusPrincipalCtrl.actualizar);

module.exports = router;