const {body} = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const {autenticar, soloInvitados} = require('../middlewares/auth');
const {verificarCsrf} = require('../middlewares/permisos');

const multer = require('multer');
const upload = multer();

const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiados intentos de inicio de sesion. Intenta nuevamente en unos minutos.'
});

//router.get('/login', soloInvitados, authCtrl.mostrarLogin);
router.post('/login',upload.none(), limitadorLogin,[
    body('email').isEmail().withMessage('Correo invalido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
], authCtrl.loginBD);
router.post('/logout', autenticar, verificarCsrf,authCtrl.logout);
router.post('/refresh', authCtrl.refreshToken);



module.exports = router;