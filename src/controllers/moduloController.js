const {validationResult} = require('express-validator');
const moduloService = require('../services/modulo.service');
const { Modulo } = require('../models');
const formatearFecha = require('../utils/formatearFecha');


exports.listar = async(req, res) =>{
    try {
        const modulos = await moduloService.listar();
        res. render('dashboard',
            {
                page:'modulos/listar',
                titulo: 'Modulos',
                 modulos,
                 formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = (req, res) =>{
    res.render('dashboard',
        {
            page:'modulos/formulario',
            titulo:'Nuevo Módulo', 
            modulo:null, errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);

    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'modulos/formulario',
                titulo:'Nuevo Módulo',
                modulo: req,body,
                errores:errores.array(),
            });
        }
    
        const {nombre, slug, descripcion, icono, orden} = req.body;
    
        const existe = await Modulo.findOne({where:{slug:slug.toLowerCase().trim()}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'modulos/formulario',
                titulo:'Nuevo Módulo',
                modulo: req.body,
                errores: [{msg:'Ya existe un modulo con ese identificador (slug).'}]
            })
        }
    
        const nuevo = await moduloService.crear({
            nombre,
            slug:slug.toLowerCase().trim(),
            descripcion,
            icono:icono || '',
            orden:orden || 0
        });

        res.redirect('/modulos?msg=creado')
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const modulo = await moduloService.obtenerPorId(id);

    if(!modulo) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Módulo no encontrado'
    });

    res.render('dashboard',{
        page:'modulos/formulario',
        titulo:'Editar Módulo',
        modulo,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const modulo = await moduloService.obtenerPorId(id);

    try {
        if(!modulo) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Módulo no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'modulos/formulario',
                titulo:'Editar Módulo',
                modulo:{...modulo.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {nombre, slug, descripcion, icono, orden, activo} = req.body;

        const actualizar = await moduloService.actualizar(id,{
            nombre,
            slug: slug.toLowerCase().trim(),
            descripcion,
            icono: icono || '',
            orden: orden || 0,
            activo: activo === 'on' || activo === true
        });

        res.redirect('/modulos?msg=editado')
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}