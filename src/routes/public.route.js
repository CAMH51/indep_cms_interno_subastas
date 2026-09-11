const router = require('express').Router();
const publicController = require('../controllers/publicController');

router.get('/f/:code',publicController.getPublicFileView);

router.get('/raw/:code',publicController.getRawUrl);

router.get('/d/:code', publicController.directDownload);

module.exports = router;