

const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const {autenticar,soloInvitados} = require('../middlewares/auth');


router.get('/', autenticar,authCtrl.panelPrincipal);




module.exports = router;