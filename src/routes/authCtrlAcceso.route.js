const {body} = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = require('express').Router();
const authCtrl = require('../controllers/authCtrlAccesosController');
const {soloInvitados} = require('../middlewares/auth');

const multer = require('multer');
const upload = multer();

const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiados intentos. Intenta nuevamente en unos minutos.'
});

router.post('/login', upload.none(), limitadorLogin, [
    body('username').notEmpty().withMessage('El usuario o correo es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
], authCtrl.loginKeycloak);

router.get('/mfa', soloInvitados, (req, res) => {
   return res.render('mfa', {
       titulo: 'Autenticación Multifactor'
   });
});

router.post('/userinfo', upload.none(), authCtrl.getUserInfo);
router.get('/userinfo', authCtrl.getUserInfo);
router.post('/getuser', upload.none(), authCtrl.getUser);
router.get('/getuser', authCtrl.getUser);
router.post('/session', upload.none(), authCtrl.crearSesionUsuario);

module.exports = router;