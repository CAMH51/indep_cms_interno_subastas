const {validationResult} = require('express-validator');
const eventosCursosService = require('../services/eventosCursos.service');
const { EventosCursos } = require('../models');
const {formatearFecha, formatearFechaCorta, formatearFechaCortaInvertida} = require('../utils/formatearFecha');
const { fn, col } = require('sequelize');


exports.listar = async(req, res) =>{
    try {
        const eventos = await eventosCursosService.listar();
        res. render('dashboard',
            {
                page:'eventosCursos/listar',
                titulo: 'Eventos en Curso', 
                eventos,
                formatearFecha,
                formatearFechaCorta
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = async(req, res) =>{
    const maxorden = await EventosCursos.findOne({
        attributes:[[fn('MAX', col('orden')), 'maxOrden']],
        raw:true
    });

    const maxOrden = maxorden?.maxOrden + 1 || 0;
    res.render('dashboard',
        {
            page:'eventosCursos/formulario',
            titulo:'Nuevo Evento en curso', 
            evento:null, 
            maxOrden,
            formatearFechaCorta,
            errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'eventosCursos/formulario',
                titulo:'Nuevo Evento en curso',
                evento: req.body,
                errores:errores.array(),
            });
        }
    
        const {titulo, actividad, fecha_inicio, hora_inicio, fecha_fin, hora_fin, orden} = req.body;
    
        const existe = await EventosCursos.findOne({where:{titulo}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'eventosCursos/formulario',
                titulo:'Nuevo Evento en curso',
                evento: req.body,
                errores: [{msg:'Ya existe un Evento con ese titulo.'}]
            });
        }
    
        const nuevo = await eventosCursosService.crear({
            titulo,
            actividad,
            fecha_inicio,
            hora_inicio,
            fecha_fin,
            hora_fin,
            orden
        });

        res.redirect('/eventos_cursos?msg=creado');
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const evento = await eventosCursosService.obtenerPorId(id);

    if(!evento) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Evento no encontrado'
    });

    res.render('dashboard',{
        page:'eventosCursos/formulario',
        titulo:'Editar Evento en Curso',
        evento,
        formatearFechaCortaInvertida,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const evento = await eventosCursosService.obtenerPorId(id);

    try {
        if(!evento) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Evento no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'eventosCursos/formulario',
                titulo:'Editar Evento en Curso',
                evento:{...evento.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {titulo, actividad, fecha_inicio, hora_inicio, fecha_fin, hora_fin, orden, activo} = req.body;

        const actualizar = await eventosCursosService.actualizar(id,{
            titulo,
            actividad,
            fecha_inicio,
            hora_inicio,
            fecha_fin,
            hora_fin,
            orden,
            activo: activo === 'on' || activo === true
        });

        res.redirect('/eventos_cursos?msg=editado')
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

