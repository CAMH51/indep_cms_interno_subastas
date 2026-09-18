const router = require('express').Router();
const slidersCtrl = require('../controllers/sliderController');
const eventosCtrl = require('../controllers/eventosCursosController');
const convocatoriasCtrl = require('../controllers/convocatoriasBienesController');
const menusLateralesCtrl = require('../controllers/menusLateralesController');
const menusPrincipalesCtrl = require('../controllers/MenusPrincipalesController');

router.get('/sliders', slidersCtrl.getAll);
router.get('/eventos_curso', eventosCtrl.getAll);
router.get('/convocatorias_bienes_muebles', convocatoriasCtrl.getAllBienesMuebles);
router.get('/convocatorias_bienes_inmuebles', convocatoriasCtrl.getAllBienesInmuebles);
router.get('/menus_izquierdos', menusLateralesCtrl.getAllMenuIzquierdo);
router.get('/menus_derechos', menusLateralesCtrl.getAllMenuDerecho);
router.get('/menus_principales', menusPrincipalesCtrl.getAll);


module.exports = router;