const {validationResult} = require('express-validator');
const menusLateralesService = require('../services/menusLaterales.service');
const {formatearFecha} = require('../utils/formatearFecha');
const { MenusLaterales } = require('../models');
const { fn, col } = require('sequelize');

exports.getAllMenuIzquierdo = async(req, res) =>{
    try {
        const {scope} = req.query;
        let menus = [];

        if(!scope){
            
            menus = await menusLateralesService.getAll('izquierdo');
        }

        menus = await menusLateralesService.getAll('izquierdo',scope);
        
        res.status(200).json({success: true, data:menus})
    } catch (error) {
        res.status(500).json({success:false, error:error.message});
    }
}


exports.getAllMenuDerecho = async(req, res) =>{
    try {
        const {scope} = req.query;
        let menus = [];

        if(!scope){
            
            menus = await menusLateralesService.getAll('derecho');
        }

        menus = await menusLateralesService.getAll('derecho',scope);
        
        res.status(200).json({success: true, data:menus})
    } catch (error) {
        res.status(500).json({success:false, error:error.message});
    }
}


exports.listarMenuIzquierdo = async(req, res) =>{
    try {
        const menusLaterales = await menusLateralesService.listar('izquierdo');
        res.render('dashboard',
            {
                page:`menusLateralesIzquierdo/listar`,
                titulo: `Menú Lateral Izquierdo`, 
                menusLaterales,
                formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}

exports.listarMenuDerecho = async(req, res) =>{
    try {
        const menusLaterales = await menusLateralesService.listar('derecho');
        res.render('dashboard',
            {
                page:'menusLateralesDerecho/listar',
                titulo: 'Menú Lateral Derecho', 
                menusLaterales,
                formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
} 


exports.formularioCrearMenuIzquierdo = async(req, res) =>{
    const maxorden = await MenusLaterales.findOne({
        attributes:[[fn('MAX', col('orden')), 'maxOrdenIzq']],
        where:{ubicacion:'izquierdo'},
        raw:true
    });

    const maxOrdenIzq = maxorden?.maxOrdenIzq + 1 || 0;
    console.log('maxOrdenIzq',maxOrdenIzq);
    res.render('dashboard',
        {
            page:`menusLateralesIzquierdo/formulario`,
            titulo:`Nuevo Menú Izquierdo`, 
            menuLateral:null, 
            maxOrdenIzq,
            errores:[]
        });
}

exports.formularioCrearMenuDerecho = async(req, res) =>{
    const maxorden = await MenusLaterales.findOne({
        attributes:[[fn('MAX', col('orden')), 'maxOrdenDer']],
        where:{ubicacion:'derecho'},
        raw:true
    });

    const maxOrdenDer = maxorden?.maxOrdenDer + 1 || 0;
    console.log('maxOrdenDer',maxOrdenDer)
    res.render('dashboard',
        {
            page:`menusLateralesDerecho/formulario`,
            titulo:`Nuevo Menú Derecho`, 
            menuLateral:null, 
            maxOrdenDer,
            errores:[]
        });
}


exports.crearMenuIzquierdo = async(req, res) =>{
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:`menusLateralesIzquierdo/formulario`,
                titulo:`Nuevo Menú Izquierdo`,
                menuLateral: req.body,
                errores:errores.array(),
            });
        }
    
        const {titulo, texto, url_imagen, link_informacion, orden, ubicacion} = req.body;
    
        const existe = await MenusLaterales.findOne({where:{texto,ubicacion:'izquierdo'}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:`menusLateralesIzquierdo/formulario`,
                titulo:`Nuevo Menú Izquierdo`,
                menuLateral: req.body,
                errores: [{msg:'Ya existe un Menú con ese texto.'}]
            });
        }
    
        const nuevo = await menusLateralesService.crear({
            titulo,
            texto,
            url_imagen,
            link_informacion,
            orden,
            ubicacion
        });

        res.redirect(`/menus_izquierdos?msg=creado`);
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}


exports.crearMenuDerecho = async(req, res) =>{
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:`menusLateralesDerecho/formulario`,
                titulo:`Nuevo Menú Derecho`,
                menuLateral: req.body,
                errores:errores.array(),
            });
        }
    
        const {titulo, texto, url_imagen, link_informacion, orden, ubicacion} = req.body;
    
        const existe = await MenusLaterales.findOne({where:{texto,ubicacion:'derecho'}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:`menusLateralesDerecho/formulario`,
                titulo:`Nuevo Menú Derecho`,
                menuLateral: req.body,
                errores: [{msg:'Ya existe un Menú con ese texto.'}]
            });
        }
    
        const nuevo = await menusLateralesService.crear({
            titulo,
            texto,
            url_imagen,
            link_informacion,
            orden,
            ubicacion
        });

        res.redirect(`/menus_derechos?msg=creado`);
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditarMenuIzquierdo = async(req, res) =>{

    const {id} = req.params;
    const menuLateral = await menusLateralesService.obtenerPorId(id, 'izquierdo');

    if(!menuLateral) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Menú Izquierdo no encontrado'
    });

    res.render('dashboard',{
        page:`menusLateralesIzquierdo/formulario`,
        titulo:`Editar Menú Izquierdo`,
        menuLateral,
        errores:[]
    })
}


exports.formEditarMenuDerecho = async(req, res) =>{

    const {id} = req.params;
    const menuLateral = await menusLateralesService.obtenerPorId(id, 'derecho');

    if(!menuLateral) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Menú Derecho no encontrado'
    });

    res.render('dashboard',{
        page:`menusLateralesDerecho/formulario`,
        titulo:`Editar Menú Derecho`,
        menuLateral,
        errores:[]
    })
}


exports.actualizarMenuIzquierdo = async(req, res) =>{
    const {id} = req.params;
    const menuLateral = await menusLateralesService.obtenerPorId(id,'izquierdo');

    try {
        if(!menuLateral) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Menú Izquierdo no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:`menusLateralesIzquierdo/formulario`,
                titulo:`Editar Menú Izquierdo`,
                menuLateral:{...menuLateral.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {titulo, texto, url_imagen, link_informacion, orden, ubicacion, activo} = req.body;

        const actualizar = await menusLateralesService.actualizar(id,{
            titulo,
            texto,
            url_imagen,
            link_informacion,
            orden,
            ubicacion,
            activo: activo === 'on' || activo === true
        });

        res.redirect(`/menus_izquierdos?msg=editado`)
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}


exports.actualizarMenuDerecho = async(req, res) =>{
    const {id} = req.params;
    const menuLateral = await menusLateralesService.obtenerPorId(id,'derecho');

    try {
        if(!menuLateral) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Menú Derecho no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:`menusLateralesDerecho/formulario`,
                titulo:`Editar Menú Derecho`,
                menuLateral:{...menuLateral.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {titulo, texto, url_imagen, link_informacion, orden, ubicacion, activo} = req.body;

        const actualizar = await menusLateralesService.actualizar(id,{
            titulo,
            texto,
            url_imagen,
            link_informacion,
            orden,
            ubicacion,
            activo: activo === 'on' || activo === true
        });

        res.redirect(`/menus_derechos?msg=editado`)
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}