const router = require('express').Router();
const {body} = require('express-validator');

const eventosCursosCtrl = require('../controllers/eventosCursosController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionEventosCursos = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('actividad').notEmpty().withMessage('La actividad es obligatorio'),
    body('fecha_inicio').notEmpty().withMessage('La Fecha de inicio es obligatorio'),
    body('hora_inicio').notEmpty().withMessage('La Hora de inicio es obligatorio'),
    body('fecha_fin').notEmpty().withMessage('La Fecha de fin es obligatorio'),
    body('hora_fin').notEmpty().withMessage('La Hora de fin es obligatorio'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
];

router.get('/', verificarPermiso('eventos_cursos.leer'),eventosCursosCtrl.listar);
router.get('/nuevo', verificarPermiso('eventos_cursos.crear'), eventosCursosCtrl.formularioCrear);
router.post('/',verificarPermiso('eventos_cursos.crear'), verificarCsrf, validacionEventosCursos, eventosCursosCtrl.crear);

router.get('/:id/editar', verificarPermiso('eventos_cursos.actualizar'), eventosCursosCtrl.formEditar);
router.post('/:id',verificarPermiso('eventos_cursos.actualizar'), verificarCsrf, validacionEventosCursos, eventosCursosCtrl.actualizar);

module.exports = router;