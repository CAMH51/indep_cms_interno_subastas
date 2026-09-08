const {validationResult} = require('express-validator');
const rolService = require('../services/rol.service');
const { Usuario,Rol, Permiso, Modulo } = require('../models');


exports.listar = async(req, res) =>{
    try {
        const roles = await rolService.listar();
        res. render('dashboard',
            {
                page:'roles/listar',
                titulo: 'Roles', 
                roles
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = (req, res) =>{
    res.render('dashboard',
        {
            page:'roles/formulario',
            titulo:'Nuevo Rol', 
            rol:null, 
            errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'roles/formulario',
                titulo:'Nuevo Rol',
                rol: req.body,
                errores:errores.array(),
            });
        }
    
        const {nombre, descripcion} = req.body;
    
        const existe = await Rol.findOne({where:{nombre}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'roles/formulario',
                titulo:'Nuevo Rol',
                rol: req.body,
                errores: [{msg:'Ya existe un rol con ese nombre.'}]
            });
        }
    
        const nuevo = await rolService.crear({
            nombre,
            descripcion
        });

        res.status(201).json({success: true, msg:'Rol creado correctamente'})
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const rol = await rolService.obtenerPorId(id);

    if(!rol) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Rol no encontrado'
    });

    res.render('dashboard',{
        page:'roles/formulario',
        titulo:'Editar Rol',
        rol,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const rol = await rolService.obtenerPorId(id);

    try {
        if(!rol) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Rol no encontrado'
        });

        const errores = validationResult(req);

        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'roles/formulario',
                titulo:'Editar Rol',
                rol:{...rol.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        console.log('req.body',req.body);
        const {nombre, descripcion, activo} = req.body;
        const datosActualizado = {
            nombre,
            descripcion,
            activo: activo === 'on' || activo === true
        }

        const actualizar = await rolService.actualizar(id,datosActualizado);

        res.status(201).json({success: true, msg:'Rol actualizado correctamente'})
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formularioPermisos= async(req, res) =>{
    const {id} = req.params;
    const rol = await Rol.findByPk(id,{
        include:{model: Permiso, as: 'permisos'}
    });

    try {
        if(!rol) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Rol no encontrado'
        });

        const modulos = await Modulo.findAll({
            where:{ activo: true},
            include: {model: Permiso, as: 'permisos'},
            order:[['orden','ASC']]
        });

        const idsAsignados = rol.permisos.map((p) => p.permiso_id);

        res.render('roles/permisos',{
            titulo: `Permisos del rol: ${rol.nombre}`,
            rol,
            modulos,
            idsAsignados
        })
    } catch (error) {
         res.status(500).json({success:false, msg:error.message});
    }
}

exports.guardarPermisos = async(req, res) =>{
    const {id} = req.params;
    const rol = await rolService.obtenerPorId(id);

    try {
        if(!rol) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Rol no encontrado'
        });

        let seleccionados = req.body.permisos || [];
        if(!Array.isArray(seleccionados)) seleccionados = [seleccionados];

        await rol.setPermisos(seleccionados);
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}