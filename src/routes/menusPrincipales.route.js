const router = require('express').Router();
const {body} = require('express-validator');

const menusPrincipalCtrl = require('../controllers/MenusPrincipalesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionMenusPrincipales = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('url').notEmpty().withMessage('La url es obligatoria'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
];

router.get('/', verificarPermiso('menus_principales.leer'),menusPrincipalCtrl.listar);
router.get('/nuevo', verificarPermiso('menus_principales.crear'), menusPrincipalCtrl.formularioCrear);
router.post('/',verificarPermiso('menus_principales.crear'), verificarCsrf, validacionMenusPrincipales, menusPrincipalCtrl.crear);

router.get('/:id/editar', verificarPermiso('menus_principales.actualizar'), menusPrincipalCtrl.formEditar);
router.post('/:id',verificarPermiso('menus_principales.actualizar'), verificarCsrf, validacionMenusPrincipales, menusPrincipalCtrl.actualizar);

module.exports = router;