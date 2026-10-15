const router = require('express').Router();
const {
    renderNewEntities,
    createEntity,
    updateEntity,
    getEntities,
    getEntityFields,
    records,
    getRecords,
    getRecord,
    showRecords,
    updateRecord,
    toggleActivoRecord,
    checkUniqueRecord,
    getMenuTree
} = require('../controllers/entityController');
const { verificarPermisoEntidad } = require('../middlewares/permisos');

// Metodos GET
router.get('/new',                  verificarPermisoEntidad('crear'), renderNewEntities);
router.get('/:name/tree',           verificarPermisoEntidad('leer'), getMenuTree);
router.get('/:name/jerarquia',      verificarPermisoEntidad('leer'), getMenuTree);
router.get('/:name/records/tree',   verificarPermisoEntidad('leer'), getMenuTree);
router.get('/:name/fields',         verificarPermisoEntidad('leer'), getEntityFields);
router.get('/:name/check-unique',   verificarPermisoEntidad('leer'), checkUniqueRecord);
router.get('/:name/records',        verificarPermisoEntidad('leer'), getRecords);
router.get('/:name/records/:id',    verificarPermisoEntidad('leer'), getRecord);
router.get('/',                     verificarPermisoEntidad('leer'), getEntities);
router.get('/:name',                verificarPermisoEntidad('leer'), showRecords);

// Metodos POST
router.post('/',                             verificarPermisoEntidad('crear'), createEntity);
router.post('/:name/update',                 verificarPermisoEntidad('actualizar'), updateEntity);
router.post('/:name/records',                verificarPermisoEntidad('crear'), records);
router.post('/:name/records/:id',            verificarPermisoEntidad('actualizar'), updateRecord);
router.post('/:name/records/:id/toggle-activo', verificarPermisoEntidad('eliminar'), toggleActivoRecord);

module.exports = router;