const {validationResult} = require('express-validator');
const usuarioService = require('../services/usuario.service');
const { Usuario,Rol, Sesion } = require('../models');
const {formatearFecha} = require('../utils/formatearFecha');


exports.listar = async(req, res) =>{
    try {
        const usuarios = await usuarioService.listar();
        
        res. render('dashboard',
            {
                page:'usuarios/listar',
                titulo: 'Usuarios', 
                usuarios,
                formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = async (req, res) =>{
    const roles = await Rol.findAll({where:{activo:true}});
    res.render('dashboard',
        {
            page:'usuarios/formulario',
            titulo:'Nuevo Usuario', 
            roles,
            usuario:null, errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);
    const roles = await Rol.findAll({where:{activo: true}});
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'usuarios/formulario',
                titulo:'Nuevo Usuario',
                modulo: req.body,
                errores:errores.array(),
            });
        }
    
        const {email, roles, activo, mfa} = req.body;
    
        const existe = await Usuario.findOne({where:{email:email.toLowerCase().trim()}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'usuarios/formulario',
                titulo:'Nuevo Usuario',
                modulo: req.body,
                errores: [{msg:'Ya existe un usuario con ese correo.'}]
            });
        }
    
        const nuevo = await usuarioService.crear({
            email: email.toLowerCase().trim(),
            fk_rol_id:roles,
            activo: activo === 'on' || activo === true,
            mfa: mfa === 'on' || mfa === true,
        });

        res.status(201).json({success: true, msg:'Usuario creado correctamente'})
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const usuario = await usuarioService.obtenerPorId(id);
    const roles = await Rol.findAll({where:{activo:true}});

    if(!usuario) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Usuario no encontrado'
    });

    res.render('dashboard',{
        page:'usuarios/formulario',
        titulo:'Editar Usuario',
        usuario,
        roles,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const usuario = await usuarioService.obtenerPorId(id);

    try {
        if(!usuario) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Usuario no encontrado'
        });

        const errores = validationResult(req);
        const rolesArray = await Rol.findAll({where: {activo: true}});

        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'usuarios/formulario',
                titulo:'Editar Usuario',
                usuario:{...usuario.toJSON(),...req.body},
                rolesArray,
                errores: errores.array()
            });
        }

        const {email, roles, activo, mfa} = req.body;
        const datosActualizado = {
            email:email.toLowerCase().trim(),
            fk_rol_id:roles,
            activo: activo === 'on' || activo === true,
            mfa: mfa === 'on' || mfa === true
        }

        const actualizar = await usuarioService.actualizar(id,datosActualizado);

        if(!datosActualizado.activo){
            await Sesion.destroy({where:{usuario_id:usuario.usuario_id}})
        }

        res.status(201).json({success: true, msg:'Usuario actualizado correctamente'})
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}