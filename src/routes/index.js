const router = require('express').Router();
const authCtrl = require('../controllers/authController');
const folderCtrl = require('../controllers/folderController');
const {autenticar,soloInvitados} = require('../middlewares/auth');

router.get('/login',soloInvitados,authCtrl.mostrarLogin);
router.use('/auth',require('./auth.route'));
router.use('/',require('./public.route'));



router.get('/perfil',autenticar,(req, res)=>{
    res.render('dashboard',{
        page:'perfil',
        titulo:'Perfil del usuario',
        usuario: req.usuario,
        sesion:req.sesion,
    })
});
router.get('/explorer',autenticar,folderCtrl.getExplorer);
router.use('/dashboard',autenticar,require('./principal.route'));
router.use('/modulos', autenticar,require('./modulos.route'));
router.use('/usuarios', autenticar,require('./usuarios.route'));
router.use('/permisos',autenticar, require('./permisos.route'));
router.use('/roles',autenticar, require('./rol.route'));
router.use('/files', autenticar,require('./file.route'));
router.use('/folders',autenticar,require('./folder.route'));
router.use('/sliders',autenticar,require('./slider.route'));
router.use('/eventos_cursos',autenticar,require('./eventosCursos.route'));
router.use('/menus_laterales',autenticar,require('./menusLaterales.route'));

module.exports = router;