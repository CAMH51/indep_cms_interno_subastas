const {Usuario, Rol, Sesion} = require('../models');
const {
    verificarAccessToken,
    verificarRefreshToken,
    duracionAMilisegundos,
    ACCESS_EXPIRES_IN
} = require('../utils/jws');
const {renovarSesion,obtenerPermisosDeUsuario} = require('../services/sesion.service');
const {opcionesAccessCookie} = require('../utils/cookies');


async function autenticar(req, res, next){
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    const noAutenticado = () =>{
        if(req.xhr || req.headers.accept?.includes('application/json')){
            return res.status(401).json({success:false,msg:'No autenticado'});
        }
        return res.redirect('/login');
    };

    if(!accessToken && !refreshToken) return noAutenticado();

    try {
        let payload;
        let sessionRenovada = false;

        try {
            payload = verificarAccessToken(accessToken);
        } catch (error) {
            if(!refreshToken) return noAutenticado();

            const payloadRefresh = verificarRefreshToken(refreshToken);
            const {accessToken: nuevoAccessToken} = await renovarSesion(
                payloadRefresh.sid,
                refreshToken
            );

            res.cookie('accessToken', nuevoAccessToken, opcionesAccessCookie);
            payload = verificarAccessToken(nuevoAccessToken);
            sessionRenovada = true;
        }

        const sesion = await Sesion.findByPk(payload.sid);
        if(!sesion || !sesion.activa) return noAutenticado();

        const usuario = await Usuario.findByPk(payload.id,{
            include: {model:Rol, as:'rol'},
        });
        if(!usuario || !usuario.activo) return noAutenticado();

        sesion.update({ultimo_uso: new Date()}).catch(() =>{});

        const permisos = await obtenerPermisosDeUsuario(usuario.dataValues.usuario_id);

        req.usuario = usuario;
        req.sesion = sesion;
        req.permisos = permisos;

        res.locals.usuarioActual = usuario;
        res.locals.permisos = permisos;
        res.locals.csrfToken = sesion.dataValues.csr_token;

        res.locals.puede = (permiso) => permisos.includes(permiso);
        res.locals.sesionRenovada = sessionRenovada;


        res.locals.accessTokenTtlMs = duracionAMilisegundos(ACCESS_EXPIRES_IN);

        next();
    } catch (error) {
        return noAutenticado();
    }
}

async function soloInvitados(req, res, next){
    const accessToken = req.cookies?.accessToken;
    if(!accessToken) return next();
    try {
        verificarAccessToken(accessToken);
        return res.redirect('/dashboard');
    } catch (error) {
        return next();
    }
}

module.exports = { autenticar, soloInvitados};