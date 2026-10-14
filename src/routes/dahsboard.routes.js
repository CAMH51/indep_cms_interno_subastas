const router = require('express').Router();
const {renderListEntities} = require('../controllers/entityController')

//Metodos GET
router.get('/',       renderListEntities);


module.exports = router;