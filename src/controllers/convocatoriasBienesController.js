const {validationResult} = require('express-validator');
const convocatoriaBienesService = require('../services/convocatoriasBienes.service');
const { ConvocatoriasBienes } = require('../models');
const {formatearFecha} = require('../utils/formatearFecha');

const render = (res,data, status)=>{
    return res.status(status).render('dashboard',data);
}


async function actualizar(req, res, id){

    const {nombre,descripcion,url_documento, tipo_bien, activo} = req.body;

        const actualizar = await convocatoriaBienesService.actualizar(id,{
            nombre,
            descripcion,
            url_documento,
            tipo_bien,
            activo: activo === 'on' || activo === true
        });
}

exports.listarConvocatoriaBienesMuebles = async(req, res) =>{
    try {
        const convocatoriasBienesMuebles = await convocatoriaBienesService.listar('mueble');
        const data ={
            page:'convocatoriasMuebles/listar',
            titulo: 'Convocatorias Muebles', 
            convocatoriasBienesMuebles,
            formatearFecha
        }
      return  render(res,data,200)
    } catch (error) {
       return res.status(500).json({success:false,msg:error.message});
    }
}


exports.listarConvocatoriaBienesInmuebles = async(req, res) =>{
    try {
        const convocatoriasBienesInmuebles = await convocatoriaBienesService.listar('inmueble');
        const data = {
            page:'convocatoriasInmuebles/listar',
            titulo: 'Convocatorias Inmuebles', 
            convocatoriasBienesInmuebles,
            formatearFecha
        }
       return render(res,data,200)
    } catch (error) {
       return res.status(500).json({success:false,msg:error.message});
    }
}


exports.formularioCrearConvocatoriasMuebles = (req, res) =>{
   return render(res, {
        page:'convocatoriasMuebles/formulario',
        titulo:'Nueva Convocatoria Muebles', 
        convocatoriaMueble:null, 
        errores:[]
    }, 200);
}

exports.formularioCrearConvocatoriasInmuebles = (req, res) =>{
   return render(res, {
        page:'convocatoriasInmuebles/formulario',
        titulo:'Nueva Convocatoria Inmuebles', 
        convocatoriaInmueble:null, 
        errores:[]
    }, 200);
}


exports.crearConvocatoriaMueble = async(req, res) =>{

    const {nombre,descripcion,url_documento, tipo_bien} = req.body;
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            const data ={
                page:'convocatoriasMuebles/formulario',
                titulo:'Nueva Convocatoria Muebles', 
                errores:errores.array(), 
            }
            data['convocatoriaMueble']= req.body;
            return render(res,data,400)
        }

          const existe = await ConvocatoriasBienes.findOne({where:{nombre:nombre,tipo_bien:'mueble'}});

            if(existe){
               return render(res,{
                    page:'convocatoriasMuebles/formulario',
                    titulo:'Nueva Convocatoria Muebles',
                    convocatoriaMueble:req.body,
                    errores: [{msg:'Ya existe una convocatoria con ese nombre.'}]
                },400);
            }


    const nuevo = await convocatoriaBienesService.crear({
        nombre,
        descripcion,
        url_documento,
        tipo_bien
    });
        return res.redirect(`/convocatorias_muebles?msg=creado`);
        
    } catch (error) {
        return res.status(500).json({success:false, msg:error.message});
    }
}

exports.crearConvocatoriaInmueble = async(req, res) =>{
    const {nombre,descripcion,url_documento, tipo_bien} = req.body;
    const errores = validationResult(req);
    try {
        if(!errores.isEmpty()){
            const data ={
                page:'convocatoriasInmuebles/formulario',
                titulo:'Nueva Convocatoria Inmuebles', 
                errores:errores.array(), 
            }
            data['convocatoriaInmueble']= req.body;
            return render(res,data,400)
        }

          const existe = await ConvocatoriasBienes.findOne({where:{nombre:nombre,tipo_bien:'inmueble'}});

            if(existe){
               return render(res,{
                    page:'convocatoriasInmuebles/formulario',
                    titulo:'Nueva Convocatoria Inmuebles',
                    convocatoriaInmueble:req.body,
                    errores: [{msg:'Ya existe una convocatoria con ese nombre.'}]
                },400);
            }

            const nuevo = await convocatoriaBienesService.crear({
                nombre,
                descripcion,
                url_documento,
                tipo_bien
            });
       return res.redirect(`/convocatorias_inmuebles?msg=creado`);
        
    } catch (error) {
        return res.status(500).json({success:false, msg:error.message});
    }
}

exports.formEditarConvocatoriaMuebles = async(req, res) =>{
    const {id} = req.params;
    const convocatoriaMueble = await convocatoriaBienesService.obtenerPorId(id, 'mueble');

    if(!convocatoriaMueble) return render(res,{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Convocatoria Mueble no encontrada'
    },404)

    return render(res, {
        page:'convocatoriasMuebles/formulario',
        titulo:'Editar Convocatoria Muebles',
        convocatoriaMueble,
        errores:[]
    },200)
}

exports.formEditarConvocatoriaInmuebles = async(req, res) =>{
    const {id} = req.params;
    const convocatoriaInmueble = await convocatoriaBienesService.obtenerPorId(id, 'inmueble');

    if(!convocatoriaInmueble) return render(res,{
        page:'error',
        titulo:'No encontrado',
        mensaje:'Convocatoria Inmueble no encontrada'
    },404)

   return render(res, {
        page:'convocatoriasInmuebles/formulario',
        titulo:'Editar Convocatoria Inmuebles',
        convocatoriaInmueble,
        errores:[]
    },200)
}

exports.actualizarConvocatoriaMueble = async(req, res) =>{
    const {id} = req.params;
    const convocatoriaMueble = await convocatoriaBienesService.obtenerPorId(id,'mueble');

    try {
        if(!convocatoriaMueble) return render(res, {
            page:'error',
            titulo:'No encontrado',
            mensaje:'Convocatoria Mueble no encontrado'
        },404)

        const errores = validationResult(req);
        if(!errores.isEmpty()){
            return render(res,{
                page:'convocatoriasMuebles/formulario',
                titulo:'Editar Convocatoria Muebles', 
                errores:errores.array(), 
                convocatoriaMueble:{...convocatoriaMueble.toJSON(),...req.body},
                errores: errores.array()
            },400)
        }

        await actualizar(req, res, id);

        return res.redirect(`/convocatorias_muebles?msg=editado`)
    } catch (error) {
        return res.status(500).json({success:false, msg:error.message});
    }
}


exports.actualizarConvocatoriaInmueble = async(req, res) =>{
    const {id} = req.params;
    const convocatoriaInmueble = await convocatoriaBienesService.obtenerPorId(id,'inmueble');

    try {
        if(!convocatoriaInmueble) return render(res, {
            page:'error',
            titulo:'No encontrado',
            mensaje:'Convocatoria Inmueble no encontrado'
        },404)

        const errores = validationResult(req);
        if(!errores.isEmpty()){
           return render(res,{
                page:'convocatoriasInmuebles/formulario',
                titulo:'Editar Convocatoria Inmuebles', 
                errores:errores.array(), 
                convocatoriaInmueble:{...convocatoriaInmueble.toJSON(),...req.body},
                errores: errores.array()
            },400)
        }

        await actualizar(req, res, id);

       return res.redirect(`/convocatorias_inmuebles?msg=editado`)
    } catch (error) {
       return res.status(500).json({success:false, msg:error.message});
    }
}
