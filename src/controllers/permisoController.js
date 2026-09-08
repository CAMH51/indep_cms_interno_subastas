const {validationResult} = require('express-validator');
const permisosService = require('../services/permiso.service');
const { Permiso, Modulo } = require('../models');


exports.listar = async(req, res) =>{
    try {
        const permisos = await permisosService.listar();
        res. render('dashboard',
            {
                page:'permisos/listar',
                titulo: 'Permisos', 
                permisos
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = async (req, res) =>{
    const modulos= await Modulo.findAll({where:{activo: true},order: [['createdAt','ASC']]})
    res.render('dashboard',
        {
            page:'permisos/formulario',
            titulo:'Nuevo Permiso', 
            permiso:null, 
            modulos,  
            errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);
    const modulos = await Modulo.findAll({where:{activo: true}});
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'permisos/formulario',
                titulo:'Nuevo Permiso',
                permiso:req.body,
                modulos,
                errores:errores.array(),
            });
        }
    
        const {modulos, accion, descripcion} = req.body;
        const fk_modulo_id = modulos;
    
        const existe = await Permiso.findOne({where:{fk_modulo_id, accion}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'permisos/formulario',
                titulo:'Nuevo Permiso',
                permiso:req.body,
                modulos,
                errores: [{msg:'Ese modulo ya cuenta con un permiso para esa accion.'}]
            });
        }
    
        const nuevo = await permisosService.crear({
            fk_modulo_id,
            accion,
            descripcion,
        });

        res.status(201).json({success: true, msg:'Permiso creado correctamente'})
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

/* exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const usuario = await usuarioService.obtenerPorId(id);

    if(!usuario) return res.status(404).render('error',{
        titulo:'No encontrado',
        mensaje:'Usuario no encontrado'
    });

    res.render('usuarios/formulario',{
        titulo:'Editar Usuario',
        usuario,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const usuario = await usuarioService.obtenerPorId(id);

    try {
        if(!usuario) return res.status(404).render('error',{
            titulo:'No encontrado',
            mensaje:'Usuario no encontrado'
        });

        const errores = validationResult(req);
        const roles = await Rol.findAll({where: {activo: true}});

        if(!errores.isEmpty()){
            return res.status(400).render('usuarios/formulario',{
                titulo:'Editar Usuario',
                usuario:{...usuario.toJSON(),...req.body},
                roles,
                errores: errores.array()
            });
        }

        const {email, fk_rol_id, activo, mfa} = req.body;
        const datosActualizado = {
            email:email.toLowerCase().trim(),
            fk_rol_id,
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
} */