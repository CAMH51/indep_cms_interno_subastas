const {validationResult} = require('express-validator');
const storageService = require('../services/storages.service');
const { Storage } = require('../models');
const {formatearFecha} = require('../utils/formatearFecha');
const activeStorage = require('../middlewares/activeStorage');


exports.listar = async(req, res) =>{
    try {
        const storages = await storageService.listar();
        res. render('dashboard',
            {
                page:'storages/listar',
                titulo: 'Storages',
                storages,
                formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = (req, res) =>{
    res.render('dashboard',
        {
            page:'storages/formulario',
            titulo:'Nuevo Storage', 
            storage:null, errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);

    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'storages/formulario',
                titulo:'Nuevo storage',
                storage: req,body,
                errores:errores.array(),
            });
        }
    
        const {name, base_path, activo} = req.body;
    
        const existe = await Storage.findOne({where:{name}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'storages/formulario',
                titulo:'Nuevo Storage',
                storage: req.body,
                errores: [{msg:'Ya existe un storage con esa ubicación'}]
            })
        }
    
        const esActivo = activo === undefined || activo === 'on' || activo === true;

        const nuevo = await storageService.crear({
            name,
            base_path,
            activo:esActivo
        });

        activeStorage.invalidate();

        res.redirect('/storages?msg=creado')
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const storage = await storageService.obtenerPorId(id);

    if(!storage) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Módulo no encontrado'
    });

    res.render('dashboard',{
        page:'storages/formulario',
        titulo:'Editar Storage',
        storage,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const storage = await storageService.obtenerPorId(id);

    try {
        if(!storage) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Módulo no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'storages/formulario',
                titulo:'Editar Storage',
                storage:{...storage.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {name, base_path, activo} = req.body;

        const actualizar = await storageService.actualizar(id,{
            name,
            base_path,
            activo: activo === 'on' || activo === true
        });

        activeStorage.invalidate();
        res.redirect('/storages?msg=editado')
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}