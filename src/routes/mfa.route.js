const rateLimit = require('express-rate-limit');
const router = require('express').Router();
const mfaCtrl = require('../controllers/mfaController');
const { soloInvitados } = require('../middlewares/auth');

const multer = require('multer');
const upload = multer();

const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiados intentos. Intenta nuevamente en unos minutos.'
});

router.get('/', soloInvitados, (req, res) => {
   return res.render('mfa', {
       titulo: 'Autenticación Multifactor'
   });
});

router.post('/token', upload.none(), limitadorLogin, mfaCtrl.getToken);
router.post('/login', upload.none(), limitadorLogin, mfaCtrl.getOTP);
router.post('/verify', upload.none(), limitadorLogin, mfaCtrl.getVerifyOTP);

module.exports = router;