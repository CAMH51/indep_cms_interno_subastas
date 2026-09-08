const {validationResult} = require('express-validator');
const {Usuario, Rol, Modulo} = require('../models');

const {crearSesion,cerrarSesion,renovarSesion}= require('../services/sesion.service');
const {verificarRefreshToken} = require('../utils/jws');
const {opcionesAccessCookie, opcionesRefreshCookie} = require('../utils/cookies');

const dataActiveDirectory = require('../services/dataActiveDirect.service');
const {loginAD} = require('../services/auth.service');

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

const credencialesInvalidas = (res, email) =>{
    return res.status(401).render('login',{
        titulo:'Iniciar Sesión',
        error:'Correo o contraseña incorrectos.',
        email
    })
}

exports.mostrarLogin =  (req, res) =>{
    res.render('login',{
        titulo:'Iniciar Sesión',
        error:null,
        email:''
    });
}

exports.loginBD = async(req,res) =>{
   const errrores = validationResult(req);
    const {email, password} = req.body;

    if(!errrores.isEmpty()){
        return res.status(400).render('login',{
            titulo:'Iniciar Sesión',
            error:'Verifica el correo y la contraseña ingresada.',
            email
        });
    } 

    const usuario = await Usuario.findOne({where:{email:email.trim()}});

    if(!usuario) return credencialesInvalidas(res, email);

    const {accessToken, refreshToken} = await crearSesion(usuario,{
            ip:req.ip,
            user_agent: req.headers['user-agent']
        });
    
        res.cookie('accessToken', accessToken, opcionesAccessCookie);
        res.cookie('refreshToken', refreshToken, opcionesRefreshCookie);
        
        res.status(200).json({success:true,msg:'Inicio de sesión correcto'});
}

exports.loginAD = async(req, res) =>{
    
    const errrores = validationResult(req);
    const {email, password} = req.body;

    if(!errrores.isEmpty()){
        return res.status(400).render('login',{
            titulo:'Iniciar Sesión',
            error:'Verifica el correo y la contraseña ingresada.',
            email
        });
    }
    try {
    
        const ad = await loginAD(email, password);
        console.log('ad',ad.mail);
    
        if(ad.mail?.toLowerCase().trim() !== email.trim()){
            return credencialesInvalidas(res, email);
        }
    
        const usuario = await Usuario.findOne({where:{email:ad.mail.trim()}});
    
        if(!usuario) return credencialesInvalidas(res, email);
    
        if(usuario.bloqueado_hasta && usuario.bloqueado_hasta.getTime() > Date.now()){
            return res.status(423).render('login',{
                titulo:'Iniciar Sesión',
                error:'Cuenta bloqueada temporalmente por intentos fallidos. Intente más tarde.',
                email
            })
        }
    
        if(!usuario.activo){
            return res.status(423).render('login',{
                titulo:'Iniciar Sesión',
                error:'Tu cuenta se encuentra inactiva. Contacta al administrador.',
                email
            });
        }
    
        const dataAD = await dataActiveDirectory.queryDataActiveDirectory(email);
    
        if(dataAD.length < 0 ){
            return res.status(423).render('login',{
                titulo:'Iniciar Sesión',
                error:'No hay datos para mostrar.',
                email
            });
        }
    
        const {accessToken, refreshToken} = await crearSesion(usuario,{
            ip:req.ip,
            user_agent: req.headers['user-agent']
        });
    
        res.cookie('accessToken', accessToken, opcionesAccessCookie);
        res.cookie('refreshToken', refreshToken, opcionesRefreshCookie);
        
        res.status(200).json({success:true,msg:'Inicio de sesión correcto'});
        //res.redirect('/dashboard');

    } catch (error) {
        return res.status(500).json({success: false, msg:error.message});
    }
}



exports.logout = async(req, res) =>{
    const id = req.sesion.sesion_id;
    await cerrarSesion(id);

    res.clearCookie('accessToken', opcionesAccessCookie);
    res.clearCookie('refreshToken', opcionesRefreshCookie);
    res.redirect('/login');
}

exports.refreshToken = async(req, res)=>{
    const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken){
        return res.status(401).json({success:false, msg:'No hay sección activa'});
    }

    try {
        const payload = verificarRefreshToken(refreshToken);
        const {accessToken} = await renovarSesion(payload.sid,refreshToken);

        res.cookie('accessToken', accessToken, opcionesAccessCookie);
        return res.json({success:true, msg:'Token renovado correctamente'})
    } catch (error) {
        res.clearCookie('accessToken', opcionesAccessCookie);
        res.clearCookie('refreshToken',opcionesRefreshCookie);
        return res.status(401).json({success: false, msg:'La sesión expiro, inicia sesión nuevamente'});
    }
}

exports.panelPrincipal = async(req, res) =>{
    //const modulos = await Modulo.findAll();
    res.render('dashboard',{
        page:'dashboard/home',
        titulo:'Panel principal',
        usuario: req.usuario,
        sesion:req.sesion,
        //modulos
    })
}