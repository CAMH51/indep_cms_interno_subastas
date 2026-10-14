
const { Op } = require('sequelize');
const {buildModel, validateDefinition, registry} = require('../models/Dynamic');
const {File, Usuario, Slider, Field} = require('../models');
const entityService = require('../services/entity.service');

const renderWithError = async (res, msg) => {
    const entities = await entityService.getAll().catch(() => []);
    res.render('dashboard', {
        page: "entities/form_nueva_entidad",
        error: msg,
        titulo: 'Nueva Libreria',
        entities
    });
};

exports.renderNewEntities = async (req, res) => {
    return await renderWithError(res, null);
};

exports.renderListEntities = async(req, res) =>{
    try {
        const entities = await entityService.getAll();
        const [totalFiles, totalUsuarios, totalSliders] = await Promise.all([
            File.count().catch(() => 0),
            Usuario.count().catch(() => 0),
            Slider.count().catch(() => 0)
        ]);

        res.render('dashboard',{
            titulo:"Dashboard",
            page:"dashboard/home",
            entities,
            stats: {
                totalEntities: entities.length,
                totalFiles,
                totalUsuarios,
                totalSliders
            }
        });
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}

exports.createEntity = async(req, res) =>{
    const name = (req.body.name || '').trim();
    const mode = req.body.mode || (req.body.is_update === 'true' ? 'update' : 'create');
    const exist = await entityService.getName(name);

    if(exist && mode !== 'update'){
       return await renderWithError(res, "Ya existe una libreria con ese nombre");
    } 

    const fields = Object.values(req.body.fields || {}).map((f) => ({
      name: (f.name || '').trim(),
      type: f.type,
      label: (f.label || '').trim(),
      length: f.length ? Number(f.length) : null,
      scale: f.scale ? Number(f.scale) : null,
      required: f.required === 'on' || f.required === true || f.required === 'true',
      unique: f.unique === 'on' || f.unique === true || f.unique === 'true',
      activo: f.activo === 'on' || f.activo === true || f.activo === 'true' || f.activo === '1',
      defaultValue: f.default || f.defaultValue || (f.name === 'activo' ? true : null)
    }));

    // Asegurar que el campo "activo" exista siempre en la entidad de forma automatica
    const hasActivoField = fields.some(f => f.name.toLowerCase() === 'activo');
    if (!hasActivoField) {
        fields.push({
            name: 'activo',
            type: 'boolean',
            label: 'Activo',
            length: null,
            scale: null,
            required: false,
            unique: false,
            activo: true,
            defaultValue: true
        });
    }

    try {
        validateDefinition(name, fields);

        let entity;
        if (exist && mode === 'update') {
            entity = await entityService.update(exist.entity_id, { name, fields });
        } else {
            entity = await entityService.create({ name, fields });
        }

        const model = buildModel(entity);
        await model.sync({ alter: true });
        // Asegurar que registros existentes sin valor de activo se establezcan en true
        await model.update({ activo: true }, { where: { activo: null } }).catch(() => {});

        return res.redirect(`/entities/${name}`);
    } catch (error) {
        return await renderWithError(res, error.message);
    }
};

exports.updateEntity = async (req, res) => {
    req.body.mode = 'update';
    if (req.params.name && !req.body.name) {
        req.body.name = req.params.name;
    }
    return exports.createEntity(req, res);
};

exports.getEntityFields = async (req, res) => {
    try {
        const entity = await entityService.getName(req.params.name);
        if (!entity) return res.status(404).json({ success: false, msg: 'Librería no encontrada' });
        return res.status(200).json({ success: true, data: entity });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.checkUniqueRecord = async (req, res) => {
    try {
        const { name } = req.params;
        const { field, value, excludeId } = req.query;

        if (!field || value === undefined || value === null || value === '') {
            return res.status(200).json({ exists: false });
        }

        const entity = await entityService.getName(name);
        if (!entity) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

        let model = registry.get(name);
        if (!model) {
            model = buildModel(entity);
        }
        if (!model) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

        const whereClause = {
            [field]: value
        };
        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId };
        }

        const existing = await model.findOne({ where: whereClause });
        return res.status(200).json({ 
            exists: Boolean(existing),
            message: existing ? `Ya existe un registro con el valor "${value}" en el campo "${field}".` : null
        });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

exports.showRecords = async (req, res) => {
    try {
        let entity = await entityService.getName(req.params.name);
        if (!entity) return res.status(404).send('Libreria no encontrada');

        // Asegurar que la entidad cuente con el campo 'activo'
        const hasActivo = entity.fields && entity.fields.some(f => f.name.toLowerCase() === 'activo');
        if (!hasActivo) {
            await Field.create({
                name: 'activo',
                label: 'Activo',
                type: 'boolean',
                required: false,
                unique: false,
                activo: true,
                fk_entity_id: entity.entity_id
            });
            entity = await entityService.getName(req.params.name);
        }

        let model = registry.get(req.params.name);
        if (!model || !hasActivo) {
            model = buildModel(entity);
            await model.sync({ alter: true });
            await model.update({ activo: true }, { where: { activo: null } }).catch(() => {});
        }

        const rows = await model.findAll({ order: [['id', 'ASC']] });
        res.status(200).render('dashboard', { 
            page:'records/home',
            titulo: entity.name,
            entity, 
            rows, 
            error: req.query.error || null 
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getEntities = async(req, res) =>{
    try {
        const entities = await entityService.getAll();

        res.status(200).json({success:true, data:entities})
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}

exports.records = async(req, res) =>{
    const entity = await entityService.getName(req.params.name);
    if (!entity) return res.status(404).json({success:false, msg:'La entidad no existe'});

    let model = registry.get(req.params.name);
    if (!model) {
        model = buildModel(entity);
    }
    if(!model) return res.status(404).json({success:false,msg:'La entidad no existe'});

    try {
        const data = {};
        for(const f of entity.fields){
            if(['id', 'entity_id','createdAt','updatedAt'].includes(f.name)) continue;

            if (f.type === 'boolean') {
                data[f.name] = (req.body[f.name] === '1' || req.body[f.name] === 'true' || req.body[f.name] === 'on' || req.body[f.name] === true);
            } else if (f.name in req.body) {
                const val = req.body[f.name];
                data[f.name] = (val === '' || val === undefined) ? null : val;
            }
        }

        // Si la entidad tiene campo activo y no fue especificado, valor por default es true
        if (entity.fields.some(f => f.name.toLowerCase() === 'activo') && (data.activo === undefined || data.activo === null)) {
            data.activo = true;
        }

        // Validar campos unicos para evitar duplicados
        for (const f of entity.fields) {
            if (f.unique && data[f.name] !== null && data[f.name] !== undefined && data[f.name] !== '') {
                const existing = await model.findOne({ where: { [f.name]: data[f.name] } });
                if (existing) {
                    const errorMsg = `Ya existe un registro con el valor "${data[f.name]}" para el campo "${f.label}". No se permiten registros duplicados.`;
                    if (req.xhr || req.headers.accept?.includes('application/json')) {
                        return res.status(400).json({ success: false, error: errorMsg, field: f.name });
                    }
                    return res.redirect(`/entities/${entity.name}?error=${encodeURIComponent(errorMsg)}`);
                }
            }
        }

        const record = await model.create(data);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(200).json({ success: true, data: record });
        }
        res.redirect(`/entities/${entity.name}`);
    } catch (error) {
        let errorMsg = error.message;
        if (error.name === 'SequelizeUniqueConstraintError') {
            const fieldNames = error.errors?.map(e => e.path).filter(Boolean).join(', ');
            errorMsg = `Ya existe un registro con ese valor ${fieldNames ? `para el campo (${fieldNames})` : ''}. No se permiten duplicados.`;
        }
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({ success: false, error: errorMsg });
        }
        res.redirect(`/entities/${entity.name}?error=${encodeURIComponent(errorMsg)}`);
    }
}

exports.updateRecord = async (req, res) => {
    const entity = await entityService.getName(req.params.name);
    if (!entity) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

    let model = registry.get(req.params.name);
    if (!model) {
        model = buildModel(entity);
    }
    if (!model) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

    try {
        const record = await model.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, msg: 'Registro no encontrado' });

        const data = {};
        for (const f of entity.fields) {
            if (['id', 'entity_id', 'createdAt', 'updatedAt'].includes(f.name)) continue;

            if (f.type === 'boolean') {
                data[f.name] = (req.body[f.name] === '1' || req.body[f.name] === 'true' || req.body[f.name] === 'on' || req.body[f.name] === true);
            } else if (f.name in req.body) {
                const val = req.body[f.name];
                data[f.name] = (val === '' || val === undefined) ? null : val;
            }
        }

        // Validar campos unicos excluyendo el registro actual
        for (const f of entity.fields) {
            if (f.unique && data[f.name] !== null && data[f.name] !== undefined && data[f.name] !== '') {
                const existing = await model.findOne({ 
                    where: { 
                        [f.name]: data[f.name],
                        id: { [Op.ne]: req.params.id }
                    } 
                });
                if (existing) {
                    const errorMsg = `Ya existe otro registro con el valor "${data[f.name]}" para el campo "${f.label}". No se permiten registros duplicados.`;
                    if (req.xhr || req.headers.accept?.includes('application/json')) {
                        return res.status(400).json({ success: false, error: errorMsg, field: f.name });
                    }
                    return res.redirect(`/entities/${entity.name}?error=${encodeURIComponent(errorMsg)}`);
                }
            }
        }

        await record.update(data);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(200).json({ success: true, data: record });
        }
        res.redirect(`/entities/${entity.name}`);
    } catch (error) {
        let errorMsg = error.message;
        if (error.name === 'SequelizeUniqueConstraintError') {
            const fieldNames = error.errors?.map(e => e.path).filter(Boolean).join(', ');
            errorMsg = `Ya existe otro registro con ese valor ${fieldNames ? `para el campo (${fieldNames})` : ''}. No se permiten duplicados.`;
        }
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({ success: false, error: errorMsg });
        }
        res.redirect(`/entities/${entity.name}?error=${encodeURIComponent(errorMsg)}`);
    }
};

exports.toggleActivoRecord = async (req, res) => {
    const entity = await entityService.getName(req.params.name);
    if (!entity) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

    let model = registry.get(req.params.name);
    if (!model) {
        model = buildModel(entity);
    }
    if (!model) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

    try {
        const record = await model.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, msg: 'Registro no encontrado' });

        const currentVal = Boolean(record.activo);
        const newVal = (req.body && ('activo' in req.body))
            ? (req.body.activo === '1' || req.body.activo === 'true' || req.body.activo === true)
            : !currentVal;

        await record.update({ activo: newVal });
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(200).json({ success: true, activo: newVal });
        }
        res.redirect(`/entities/${entity.name}`);
    } catch (error) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.redirect(`/entities/${entity.name}?error=${encodeURIComponent(error.message)}`);
    }
};

exports.getRecord = async (req, res) => {
    try {
        const entity = await entityService.getName(req.params.name);
        if (!entity) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

        let model = registry.get(req.params.name);
        if (!model) {
            model = buildModel(entity);
        }
        if (!model) return res.status(404).json({ success: false, msg: 'La entidad no existe' });

        const record = await model.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, msg: 'Registro no encontrado' });

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getRecords = async(req, res)=>{
    try {
        const entity = await entityService.getName(req.params.name);
        let model = registry.get(req.params.name);
        if (!model && entity) {
            model = buildModel(entity);
        }
        if(!model) return res.status(404).json({success:false, msg:'La entidad no existe'});
        const records = await model.findAll()
        res.status(200).json({success:true, data:records})
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}