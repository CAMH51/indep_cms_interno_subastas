const {validationResult} = require('express-validator');
const menusLateralesService = require('../services/menusLaterales.service');
const { MenusLaterales } = require('../models');


exports.listar = async(req, res) =>{
    try {
        const {lado} = req.query;
        const menusLaterales = await menusLateralesService.listar(lado);
        const ladoCapital = lado.charAt(0).toUpperCase() + lado.slice(1);
        res. render('dashboard',
            {
                page:`menusLaterales${ladoCapital}/listar`,
                titulo: `Menú Lateral ${ladoCapital}`, 
                menusLaterales
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
}

/* exports.listarDerecho = async(req, res) =>{
    try {
        const menusLateralesDer = await menusLateralesService.listar('derecho');
        res. render('dashboard',
            {
                page:'menusLateralesDerecho/listar',
                titulo: 'Menú Lateral Derecho', 
                menusLateralesDer
            });
    } catch (error) {
        res.status(500).json({success:false,msg:error.message});
    }
} */


exports.formularioCrear = (req, res) =>{
    const {lado} = req.query;
    const ladoCapital = lado.charAt(0).toUpperCase() + lado.slice(1);
    res.render('dashboard',
        {
            page:`menusLaterales${ladoCapital}/formulario`,
            titulo:`Nuevo Menú ${ladoCapital}`, 
            menuLateral:null, 
            errores:[]
        });
}


exports.crear = async(req, res) =>{
    const {lado} = req.query;
    const ladoCapital = lado.charAt(0).toUpperCase() + lado.slice(1);
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:`menusLaterales${ladoCapital}/formulario`,
                titulo:`Nuevo Menú ${ladoCapital}`,
                menuLateral: req.body,
                errores:errores.array(),
            });
        }
    
        const {titulo, texto, url_imagen, link_informacion, orden, ubicacion} = req.body;
    
        const existe = await MenusLaterales.findOne({where:{texto}});
    
        if(existe){
            return res.status(400).render('dashboard',{
                page:`menusLaterales${ladoCapital}/formulario`,
                titulo:`Nuevo Menú ${ladoCapital}`,
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

        res.redirect(`/menus_laterales?lado=${lado}?msg=creado`);
        
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditar = async(req, res) =>{
    const {lado} = req.query;
    const ladoCapital = lado.charAt(0).toUpperCase() + lado.slice(1);
    const {id} = req.params;
    const menuLateral = await menusLateralesService.obtenerPorId(id, lado);

    if(!menuLateral) return res.status(404).render('dashboard',{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Menú Lateral no encontrado'
    });

    res.render('dashboard',{
        page:`menusLaterales${ladoCapital}/formulario`,
        titulo:`Editar Menú ${ladoCapital}`,
        menuLateral,
        errores:[]
    })
}

exports.actualizar = async(req, res) =>{
    const {lado} = req.query;
    const ladoCapital = lado.charAt(0).toUpperCase() + lado.slice(1);
    const {id} = req.params;
    const menuLateral = await menusLateralesService.obtenerPorId(id,lado);

    try {
        if(!menuLateral) return res.status(404).render('dashboard',{
            page:'error',
            titulo:'No encontrado',
            mensaje:'Menú Lateral no encontrado'
        });

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return res.status(400).render('dashboard',{
                page:`menusLaterales${ladoCapital}/formulario`,
                titulo:`Editar Menú ${ladoCapital}`,
                menuLateral:{...menuLateral.toJSON(),...req.body},
                errores: errores.array()
            });
        }

        const {titulo, texto, url_imagen, link_informacion, orden, ubicacion, activo} = req.body;

        const actualizar = await eventosCursosService.actualizar(id,{
            titulo,
            texto,
            url_imagen,
            link_informacion,
            orden,
            ubicacion,
            activo: activo === 'on' || activo === true
        });

        res.redirect(`/menus_laterales?lado=${lado}?msg=editado`)
    } catch (error) {
        res.status(500).json({success:false, msg:error.message});
    }
}

