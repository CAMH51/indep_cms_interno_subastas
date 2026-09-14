const router = require('express').Router();
const {body} = require('express-validator');

const convocatoriasMueblesCtrl = require('../controllers/convocatoriasBienesController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionConvocatoriasInmuebles = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('url_documento').notEmpty().withMessage('La URL del documento es obligatorio'),
];

router.get('/', verificarPermiso('convocatorias_inmuebles.leer'),convocatoriasMueblesCtrl.listarConvocatoriaBienesInmuebles);
router.get('/nuevo', verificarPermiso('convocatorias_inmuebles.crear'), convocatoriasMueblesCtrl.formularioCrearConvocatoriasInmuebles);
router.post('/',verificarPermiso('convocatorias_inmuebles.crear'), verificarCsrf, validacionConvocatoriasInmuebles, convocatoriasMueblesCtrl.crearConvocatoriaInmueble);

router.get('/:id/editar', verificarPermiso('convocatorias_inmuebles.actualizar'), convocatoriasMueblesCtrl.formEditarConvocatoriaInmuebles);
router.post('/:id',verificarPermiso('convocatorias_inmuebles.actualizar'), verificarCsrf, validacionConvocatoriasInmuebles, convocatoriasMueblesCtrl.actualizarConvocatoriaInmueble);

module.exports = router;