const router = require('express').Router();
const {body} = require('express-validator');

const sliderCtrl = require('../controllers/sliderController');
const {verificarPermiso, verificarCsrf} = require('../middlewares/permisos');


const validacionSlider = [
    body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
    body('orden').notEmpty().withMessage('El orden es obligatorio'),
];

router.get('/', verificarPermiso('sliders.leer'),sliderCtrl.listar);
router.get('/nuevo', verificarPermiso('sliders.crear'), sliderCtrl.formularioCrear);
router.post('/',verificarPermiso('sliders.crear'), verificarCsrf, validacionSlider, sliderCtrl.crear);

router.get('/:id/editar', verificarPermiso('sliders.actualizar'), sliderCtrl.formEditar);
router.post('/:id',verificarPermiso('sliders.actualizar'), verificarCsrf, validacionSlider, sliderCtrl.actualizar);

module.exports = router;