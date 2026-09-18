const {validationResult} = require('express-validator');
const sliderService = require('../services/slider.service');
const { Slider } = require('../models');
const {formatearFecha} = require('../utils/formatearFecha');
const { fn, col } = require('sequelize');


//Para Api

exports.getAll = async(req, res) =>{
    try {
        const {scope} = req.query;
        let sliders = [];

        if(!scope){
            
            sliders = await sliderService.getAll();
        }

        sliders = await sliderService.getAll(scope);
        
        res.status(200).json({success: true, data:sliders})
    } catch (error) {
        res.status(500).json({success:false, error:error.message});
    }
}


exports.listar = async(req, res) =>{
    try {
        const sliders = await sliderService.listar();
        res. render('dashboard',
            {
                page:'sliders/listar',
                titulo: 'Sliders', 
                sliders,
                formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = async(req, res) =>{
    const maxorden = await Slider.findOne({
        attributes:[[fn('MAX', col('orden')), 'maxOrden']],
        raw:true
    });

    const maxOrden = maxorden?.maxOrden + 1 || 0;
    res.render('dashboard',
        {
            page:'sliders/formulario',
            titulo:'Nuevo Slider', 
            slider:null, 
            maxOrden,
            errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'sliders/formulario',
                titulo:'Nuevo Slider',
                slider: req.body,
                errores:errores.array(),
            });
        }
    
        const {titulo, url_imagen, link_informacion, orden} = req.body;
    
        const existe = await Slider.findOne({where:{titulo}});
    
        if(existe){
             return res.status(400).render('dashboard',{
                page:'sliders/formulario',
                titulo:'Nuevo Slider',
                slider: req.body,
                errores: [{msg:'Ya existe un slider con ese titulo.'}]
            }); 
        }
    
        const nuevo = await sliderService.crear({
            titulo,
            url_imagen: url_imagen || null,
            link_informacion:link_informacion || null,
            orden: orden ? parseInt(orden) : 0
        });

        res.redirect('/sliders?msg=creado');
        
    } catch (error) {
        return res.status(500).render('dashboard',{
            page:'sliders/formulario',
            titulo:'Nuevo Slider',
            slider: req.body,
            errores: [{msg: 'Ocurrió un error al guardar el slider: ' + error.message}]
        });
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const slider = await sliderService.obtenerPorId(id);

    if(!slider) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Rol no encontrado'
    });

    res.render('dashboard',{
        page:'sliders/formulario',
        titulo:'Editar Slider',
        slider,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const slider = await sliderService.obtenerPorId(id);

    try {
        if(!slider) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Módulo no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'sliders/formulario',
                titulo:'Editar Slider',
                slider:{...modulo.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {titulo, url_imagen, link_informacion, orden, activo} = req.body;

        const actualizar = await sliderService.actualizar(id,{
            titulo,
            url_imagen: url_imagen || null,
            link_informacion:link_informacion || null,
            orden,
            activo: activo === 'on' || activo === true
        });

        res.redirect('/sliders?msg=editado')
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

