const router = require('express').Router();
const {body} = require('express-validator');

const convocatoriasMueblesCtrl = require('../controllers/convocatoriasBienesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionConvocatoriasMuebles = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('url_documento').notEmpty().withMessage('La URL del documento es obligatorio'),
];

router.get('/', verificarPermiso('convocatorias_muebles.leer'),convocatoriasMueblesCtrl.listarConvocatoriaBienesMuebles);
router.get('/nuevo', verificarPermiso('convocatorias_muebles.crear'), convocatoriasMueblesCtrl.formularioCrearConvocatoriasMuebles);
router.post('/',verificarPermiso('convocatorias_muebles.crear'), verificarCsrf, validacionConvocatoriasMuebles, convocatoriasMueblesCtrl.crearConvocatoriaMueble);

router.get('/:id/editar', verificarPermiso('convocatorias_muebles.actualizar'), convocatoriasMueblesCtrl.formEditarConvocatoriaMuebles);
router.post('/:id',verificarPermiso('convocatorias_muebles.actualizar'), verificarCsrf, validacionConvocatoriasMuebles, convocatoriasMueblesCtrl.actualizarConvocatoriaMueble);

module.exports = router;