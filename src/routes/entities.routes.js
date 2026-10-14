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
    checkUniqueRecord
} = require('../controllers/entityController');

//Metodos GET
router.get('/new',                  renderNewEntities);
router.get('/:name/fields',         getEntityFields);
router.get('/:name/check-unique',   checkUniqueRecord);
router.get('/:name/records',        getRecords);
router.get('/:name/records/:id',    getRecord);
router.get('/',                     getEntities);
router.get('/:name',                showRecords);

//Metodos POST
router.post('/',                             createEntity);
router.post('/:name/update',                 updateEntity);
router.post('/:name/records',                records);
router.post('/:name/records/:id',            updateRecord);
router.post('/:name/records/:id/toggle-activo', toggleActivoRecord);

module.exports = router;