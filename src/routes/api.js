const router = require('express').Router();
const dynamicApiCtrl = require('../controllers/api/dynamicApiController');

// API Dinámica para consultar registros de librerías
router.get('/librerias', dynamicApiCtrl.getRecords);
router.get('/librerias/lista', dynamicApiCtrl.listLibrerias);
router.get('/librerias/:name/tree', dynamicApiCtrl.getMenuTree);
router.get('/librerias/:name/jerarquia', dynamicApiCtrl.getMenuTree);
router.get('/librerias/:name/menu-jerarquico', dynamicApiCtrl.getMenuTree);
router.get('/librerias/:name/registro/:id', dynamicApiCtrl.getRecordById);
router.get('/librerias/:name/:filtro', dynamicApiCtrl.getRecords);
router.get('/librerias/:name', dynamicApiCtrl.getRecords);

// Rutas alias para entidades/entities
router.get('/entities/:name/tree', dynamicApiCtrl.getMenuTree);
router.get('/entities/:name/jerarquia', dynamicApiCtrl.getMenuTree);
router.get('/entities/:name/menu-jerarquico', dynamicApiCtrl.getMenuTree);
router.get('/entities/:name/registro/:id', dynamicApiCtrl.getRecordById);
router.get('/entities/:name/:filtro', dynamicApiCtrl.getRecords);
router.get('/entities/:name', dynamicApiCtrl.getRecords);

module.exports = router;