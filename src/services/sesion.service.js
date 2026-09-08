const bcrypt = require('bcryptjs');
const crypto = require('crypto');
//const { v4: uuidv4} = require('uudi');
const {Sesion, Usuario, Rol, Permiso, Modulo} = require('../models');
const {
    generarAccessToken,
    generarRefreshToken,
    duracionAMilisegundos,
    REFRESH_EXPIRES_IN
} = require('../utils/jws');


async function crearSesion(usuario, meta = {}) {
    const usuario_id = usuario.dataValues.usuario_id;
    await Sesion.update({ activa: false }, { where: { fk_usuario_id: usuario.usuario_id, activa: true } });

    const csrfToken = crypto.randomBytes(32).toString('hex');
    const expiraEn = new Date(Date.now() + duracionAMilisegundos(REFRESH_EXPIRES_IN));

    // 1. Crear la sesión primero para obtener su id (sid)
    const sesion = await Sesion.create({
        fk_usuario_id: usuario.usuario_id,
        refresh_token_hash: null, // se llena después
        csr_token: csrfToken,
        ip: meta.ip || null,
        user_agent: meta.userAgent || null,
        activa: true,
        ultimo_uso: new Date(),
        expira_en: expiraEn
    });

    //console.log('usuario',usuario)

    const sid = sesion.dataValues.sesion_id; // <-- aquí obtienes el id recién creado

    // 2. Ahora sí generar los tokens con el sid real
    const accessToken = generarAccessToken({ id: usuario_id, sid });
    const refreshToken = generarRefreshToken({ id: usuario_id, sid });

    // 3. Guardar el hash del refresh token en esa misma sesión
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await sesion.update({ refresh_token_hash: refreshTokenHash });

    return { accessToken, refreshToken, csrfToken, sesion };
}


async function renovarSesion(id, refreshToken){
    const sesion = await Sesion.findByPk(id);

    if(!sesion || !sesion.activa){
        throw new Error('SESIÓN NO ENCONTRADA');
    }

    if(sesion.expiraEn.getTime() < Date.now()){
        await sesion.update({activa: false});
        throw new Error('SESIÓN EXPIRADA');
    }

    const coincide = await bcrypt.compare(refreshToken, sesion.refresh_token_hash);
    if(!coincide){
        await sesion.update({activa:false});
        throw new Error('REFRESH TOKEN INVALIDO');
    }

    const usuario = await Usuario.findByPk(sesion.fk_usuario_id);
    if(!usuario || !usuario.activo){
        await sesion.update({activa: false});
        throw new Error('USUARIO INACTIVO');
    }

    const nuevoAccessToken = generarAccessToken({id:usuario.usuario_id, id});

    await sesion.update({ultimo_uso: new Date()});

    return {accessToken: nuevoAccessToken, usuario, sesion};
}

async function cerrarSesion(id){
    if(!id) return;
    await Sesion.destroy({where:{sesion_id:id}});
}


async function obtenerPermisosDeUsuario(usuarioId){
    const usuario = await Usuario.findByPk(usuarioId,{
        include:{
            model:Rol,
            as:'rol',
                include:{
                    model:Permiso,
                    as: 'permisos',
                        include:{model:Modulo, as:'modulo'}
                }
        }
    });

    if(!usuario  || !usuario.rol) return [];

    return usuario.rol.permisos.map((p) => `${p.modulo.slug}.${p.accion}`)
}

module.exports = {
    crearSesion,
    renovarSesion,
    cerrarSesion,
    obtenerPermisosDeUsuario,
}