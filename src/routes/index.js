const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const {autenticar,soloInvitados} = require('../middlewares/auth');

router.get('/login',soloInvitados,authCtrl.mostrarLogin);
router.use('/auth',require('./auth.route'));



router.get('/perfil',autenticar,(req, res)=>{
    res.render('dashboard',{
        page:'perfil',
        titulo:'Perfil del usuario',
        usuario: req.usuario,
        sesion:req.sesion,
    })
});
router.use('/dashboard',autenticar,require('./principal.route'));
router.use('/modulos', autenticar,require('./modulos.route'));
router.use('/usuarios', autenticar,require('./usuarios.route'));
router.use('/permisos',autenticar, require('./permisos.route'));
router.use('/roles',autenticar, require('./rol.route'));

module.exports = router;