const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const folderCtrl = require('../controllers/folderController');
const {autenticar,soloInvitados} = require('../middlewares/auth');

router.get('/login',soloInvitados,authCtrl.mostrarLogin);
router.get('/login_2',soloInvitados,authCtrl.mostrarLogin2);
router.use('/auth',require('./auth.route'));
router.use('/authCtrlAcceso',require('./authCtrlAcceso.route'));
router.use('/mfa',require('./mfa.route'));
router.use('/',require('./public.route'));

router.use('/entities', autenticar, require('./entities.routes'));

router.get('/perfil',autenticar,(req, res)=>{
    res.render('dashboard',{
        page:'perfil',
        titulo:'Perfil del usuario',
        usuario: req.usuario,
        sesion:req.sesion,
    })
});

router.use('/dashboard', autenticar, require('./dahsboard.routes'));
router.use('/modulos', autenticar,require('./modulos.route'));
router.use('/usuarios', autenticar,require('./usuarios.route'));
router.use('/permisos',autenticar, require('./permisos.route'));
router.use('/roles',autenticar, require('./rol.route'));
router.use('/files', autenticar,require('./file.route'));
router.use('/folders',autenticar,require('./folder.route'));
router.use('/sliders',autenticar,require('./slider.route'));
router.use('/eventos_cursos',autenticar,require('./eventosCursos.route'));
router.use('/menus_izquierdos',autenticar,require('./menusIzquierdos.route'));
router.use('/menus_derechos',autenticar,require('./menusDerechos.route'));
router.use('/convocatorias_muebles',autenticar,require('./convocatoriasMuebles.route'));
router.use('/convocatorias_inmuebles',autenticar,require('./convocatoriasInmuebles.route'));
router.use('/documentos',autenticar,require('./documentos.route'));
router.use('/menus_principales',autenticar,require('./menusPrincipales.route'));
router.use('/storages',autenticar,require('./storages.route'));

module.exports = router;