const {validationResult} = require('express-validator');
const menusPrincipalesService = require('../services/menusPrincipales.service');
const { MenusPrincipales } = require('../models');
const {formatearFecha} = require('../utils/formatearFecha');
const { fn, col } = require('sequelize');


exports.listar = async(req, res) =>{
    try {
        const menusPrincipal = await menusPrincipalesService.listar();
        res. render('dashboard',
            {
                page:'menusPrincipales/listar',
                titulo: 'Menú Principal', 
                menusPrincipal,
                formatearFecha
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrear = async(req, res) =>{
    const menusPrincipal = await menusPrincipalesService.listar();
    const maxorden = await MenusPrincipales.findOne({
        attributes:[[fn('MAX', col('orden')), 'maxOrden']],
        raw:true
    });

    const maxOrden = maxorden?.maxOrden + 1 || 0;
    res.render('dashboard',
        {
            page:'menusPrincipales/formulario',
            titulo:'Nuevo Menú Principal', 
            menuPrincipal:null,
            menusPrincipal, 
            maxOrden,
            errores:[]
        });
}


exports.crear = async(req, res) =>{
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'menusPrincipales/formulario',
                titulo:'Nuevo Menú Principal',
                menuPrincipal: req.body,
                errores:errores.array(),
            });
        }
    
        const {titulo, url, sitio_padre, icono, orden} = req.body;
    
        const existe = await MenusPrincipales.findOne({where:{titulo}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:'menusPrincipales/formulario',
                titulo:'Nuevo Menú Principal',
                menuPrincipal: req.body,
                errores: [{msg:'Ya existe un Menú con ese titulo.'}]
            });
        }
    
        const nuevo = await menusPrincipalesService.crear({
            titulo,
            url,
            sitio_padre,
            icono,
            orden
        });

        res.redirect('/menus_principales?msg=creado');
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {id} = req.params;
    const menuPrincipal = await menusPrincipalesService.obtenerPorId(id);
    const menusPrincipal = await menusPrincipalesService.listar();

    if(!menuPrincipal) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Menú no encontrado'
    });

    res.render('dashboard',{
        page:'menusPrincipales/formulario',
        titulo:'Editar Menú Principal',
        menusPrincipal,
        menuPrincipal,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {id} = req.params;
    const menuPrincipal = await menusPrincipalesService.obtenerPorId(id);

    try {
        if(!menuPrincipal) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Menú no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:'menusPrincipales/formulario',
                titulo:'Editar Menú Principal',
                menuPrincipal:{...menuPrincipal.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {titulo, url, sitio_padre, icono, orden, activo} = req.body;

        const actualizar = await menusPrincipalesService.actualizar(id,{
            titulo,
            url,
            sitio_padre,
            icono,
            orden,
            activo: activo === 'on' || activo === true
        });

        res.redirect('/menus_principales?msg=editado')
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

