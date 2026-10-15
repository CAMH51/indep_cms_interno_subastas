const { buildModel, registry } = require('../../models/Dynamic');
const { Field } = require('../../models');
const entityService = require('../../services/entity.service');
const sequelize = require('../../config/dbPostrgres');
const { detectarCampoPadre, detectarCampoOrden, construirArbolJerarquico } = require('../../utils/treeHelper');


/**
 * Resuelve y normaliza el parámetro de filtro:
 * - 'todos': devuelve todos los registros (sin filtrar por activo)
 * - 'true': devuelve solo registros activos (activo = true)
 * - 'false': devuelve solo registros inactivos (activo = false)
 *
 * Se puede enviar mediante query param:
 *   ?activo=true | false | todos
 *   ?filtro=true | false | todos
 *   ?scope=activos | inactivos | todos
 *   ?status=true | false | all
 * O mediante path param:
 *   /librerias/:name/:filtro
 */
function resolverFiltro(req) {
    const rawFiltro = req.query.activo 
        ?? req.query.filtro 
        ?? req.query.scope 
        ?? req.query.status 
        ?? req.query.estado 
        ?? req.query.filter
        ?? req.params.filtro;

    const tieneFlagTodos = req.query.todos === 'true' || req.query.todos === '1' || req.query.all === 'true' || req.query.all === '1';
    if (tieneFlagTodos) {
        return 'todos';
    }

    if (rawFiltro !== undefined && rawFiltro !== null && rawFiltro !== '') {
        const val = String(rawFiltro).trim().toLowerCase();

        if (['todos', 'all', 'todo', 'ambos', 'both', '*'].includes(val)) {
            return 'todos';
        }
        if (['true', '1', 't', 'activo', 'activos', 'si', 'yes'].includes(val)) {
            return 'true';
        }
        if (['false', '0', 'f', 'inactivo', 'inactivos', 'no'].includes(val)) {
            return 'false';
        }
    }

    // Por defecto cuando no se especifica filtro: devuelve todos los registros
    return 'todos';
}

/**
 * Obtiene o inicializa la entidad y el modelo Sequelize dinámico correspondiente.
 */
async function obtenerModeloEntidad(nombreLibreria) {
    const name = (nombreLibreria || '').trim().toLowerCase();
    if (!name) return null;

    let entity = await entityService.getName(name);
    if (!entity) return null;

    // Asegurar que la entidad cuente con el campo 'activo'
    const hasActivo = entity.fields && entity.fields.some(f => f.name.toLowerCase() === 'activo');
    if (!hasActivo && Field) {
        try {
            await Field.create({
                name: 'activo',
                label: 'Activo',
                type: 'boolean',
                required: false,
                unique: false,
                activo: true,
                fk_entity_id: entity.entity_id
            });
            entity = await entityService.getName(name);
        } catch (e) {
            // Si ya existe o concurrencia, ignorar
        }
    }

    let model = registry.get(name);
    if (!model) {
        const tableName = `lib_${name}`;
        if (sequelize.isDefined(tableName)) {
            model = sequelize.model(tableName);
            registry.set(name, model);
        } else {
            model = buildModel(entity);
        }
    }

    return { entity, model };
}

/**
 * Consulta dinámica de registros de una librería.
 * Parámetros soportados:
 * - Nombre de la librería: req.params.name || req.query.name || req.query.nombre || req.query.libreria
 * - Filtro de estatus activo:
 *     ?activo=todos | true | false
 *     ?filtro=todos | true | false
 *     ?scope=todos | activos | inactivos
 */
exports.getRecords = async (req, res) => {
    try {
        const libraryName = req.params.name 
            || req.params.nombre 
            || req.params.libreria 
            || req.query.name 
            || req.query.nombre 
            || req.query.libreria;

        // Si no se envía nombre, listamos las librerías disponibles y cómo consultarlas
        if (!libraryName) {
            const entities = await entityService.getAll();
            return res.status(200).json({
                success: true,
                mensaje: 'Especifique el nombre de una librería para consultar sus registros. Ej: /api/v1/librerias/:nombre?activo=todos|true|false',
                total: entities.length,
                librerias: entities.map(e => ({
                    name: e.name,
                    endpoint: `/api/v1/librerias/${e.name}`,
                    campos: e.fields ? e.fields.map(f => f.name) : []
                }))
            });
        }

        const dataEntity = await obtenerModeloEntidad(libraryName);
        if (!dataEntity) {
            return res.status(404).json({
                success: false,
                msg: `La librería '${libraryName}' no existe o no fue encontrada.`
            });
        }

        const { entity, model } = dataEntity;
        const filtro = resolverFiltro(req);

        // Construir condición WHERE
        const whereClause = {};
        const tieneCampoActivo = Boolean(
            (model.rawAttributes && model.rawAttributes.activo) ||
            (entity.fields && entity.fields.some(f => f.name.toLowerCase() === 'activo'))
        );

        if (tieneCampoActivo) {
            if (filtro === 'true') {
                whereClause.activo = true;
            } else if (filtro === 'false') {
                whereClause.activo = false;
            }
            // Si filtro === 'todos', no se restringe por activo
        }

        const order = model.rawAttributes?.id ? [['id', 'ASC']] : undefined;
        const records = await model.findAll({
            where: whereClause,
            order
        });

        return res.status(200).json({
            success: true,
            libreria: entity.name,
            filtro: filtro,
            total: records.length,
            data: records
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Obtener un registro individual por su ID dentro de la librería.
 */
exports.getRecordById = async (req, res) => {
    try {
        const libraryName = req.params.name || req.params.nombre || req.params.libreria;
        const id = req.params.id;

        if (!libraryName) {
            return res.status(400).json({ success: false, msg: 'Debe especificar el nombre de la librería' });
        }
        if (!id) {
            return res.status(400).json({ success: false, msg: 'Debe especificar el ID del registro' });
        }

        const dataEntity = await obtenerModeloEntidad(libraryName);
        if (!dataEntity) {
            return res.status(404).json({ success: false, msg: `La librería '${libraryName}' no existe.` });
        }

        const { entity, model } = dataEntity;
        const record = await model.findByPk(id);

        if (!record) {
            return res.status(404).json({ success: false, msg: 'Registro no encontrado' });
        }

        return res.status(200).json({
            success: true,
            libreria: entity.name,
            data: record
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Listado de todas las librerías dinámicas existentes.
 */
exports.listLibrerias = async (req, res) => {
    try {
        const entities = await entityService.getAll();
        return res.status(200).json({
            success: true,
            total: entities.length,
            data: entities.map(e => ({
                id: e.entity_id,
                name: e.name,
                campos: e.fields ? e.fields.map(f => ({
                    name: f.name,
                    label: f.label,
                    type: f.type,
                    required: f.required,
                    unique: f.unique,
                    activo: f.activo
                })) : []
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Aliases para máxima compatibilidad
exports.getAll = exports.getRecords;
exports.consultar = exports.getRecords;
exports.getById = exports.getRecordById;

/**
 * Consulta jerárquica para entidades tipo Menú Jerárquico.
 * Agrupa los registros padres con sus respectivos hijos en el arreglo 'submenus' y 'children'.
 * Parámetros soportados:
 * - Nombre de la librería: req.params.name || req.query.name || etc.
 * - Filtro de estatus activo:
 *     ?activo=todos | true | false
 */
exports.getMenuTree = async (req, res) => {
    try {
        const libraryName = req.params.name 
            || req.params.nombre 
            || req.params.libreria 
            || req.query.name 
            || req.query.nombre 
            || req.query.libreria;

        if (!libraryName) {
            return res.status(400).json({
                success: false,
                msg: 'Debe especificar el nombre de la librería o menú.'
            });
        }

        const dataEntity = await obtenerModeloEntidad(libraryName);
        if (!dataEntity) {
            return res.status(404).json({
                success: false,
                msg: `La librería '${libraryName}' no existe o no fue encontrada.`
            });
        }

        const { entity, model } = dataEntity;

        const campoPadre = detectarCampoPadre(entity, model);
        if (!campoPadre) {
            return res.status(400).json({
                success: false,
                msg: `La librería '${entity.name}' no tiene definido un campo de jerarquía (parent_id o padre_id)`
            });
        }

        const campoOrden = detectarCampoOrden(entity, model);
        const filtro = resolverFiltro(req);

        // Construir condición WHERE
        const whereClause = {};
        const tieneCampoActivo = Boolean(
            (model.rawAttributes && model.rawAttributes.activo) ||
            (entity.fields && entity.fields.some(f => f.name.toLowerCase() === 'activo'))
        );

        if (tieneCampoActivo) {
            if (filtro === 'true') {
                whereClause.activo = true;
            } else if (filtro === 'false') {
                whereClause.activo = false;
            }
        }

        const orderClause = [];
        if (campoOrden) {
            orderClause.push([campoOrden, 'ASC']);
        }
        if (model.rawAttributes?.id) {
            orderClause.push(['id', 'ASC']);
        }

        const records = await model.findAll({
            where: whereClause,
            order: orderClause.length > 0 ? orderClause : undefined
        });

        const tree = construirArbolJerarquico(records, campoPadre, campoOrden);

        return res.status(200).json({
            success: true,
            libreria: entity.name,
            es_jerarquico: true,
            campo_padre: campoPadre,
            campo_orden: campoOrden,
            filtro: filtro,
            total_registros: records.length,
            total_padres: tree.length,
            data: tree
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getJerarquia = exports.getMenuTree;
exports.tree = exports.getMenuTree;

