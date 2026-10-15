/**
 * Utilidades para detección y armado de jerarquías tipo árbol (Padres -> Hijos/Submenús)
 */

/**
 * Detecta el nombre del campo que define la relación con el padre (parent_id)
 * @param {Object} entity - Objeto con definición de la entidad (fields)
 * @param {Object} model - Modelo Sequelize opcional
 * @returns {string|null} Nombre del campo padre o null si no se encuentra
 */
function detectarCampoPadre(entity, model) {
    if (entity?.fields && Array.isArray(entity.fields)) {
        // 1. Buscar campo cuyo tipo sea explícitamente 'parent_id'
        const fieldParentType = entity.fields.find(f => f.type === 'parent_id');
        if (fieldParentType) return fieldParentType.name;

        // 2. Buscar por nombres convencionales en los campos de la entidad
        const candidateNames = ['padre_id', 'parent_id', 'id_padre', 'parent', 'menu_padre_id', 'fk_parent_id', 'id_menu_padre'];
        const fieldByName = entity.fields.find(f => candidateNames.includes(f.name.toLowerCase()));
        if (fieldByName) return fieldByName.name;
    }

    if (model?.rawAttributes) {
        const candidateNames = ['padre_id', 'parent_id', 'id_padre', 'parent', 'menu_padre_id', 'fk_parent_id'];
        for (const cand of candidateNames) {
            if (model.rawAttributes[cand]) return cand;
        }
    }

    return null;
}

/**
 * Detecta el nombre del campo que define el orden de despliegue
 * @param {Object} entity
 * @param {Object} model
 * @returns {string} Nombre del campo de orden ('orden', 'order', etc.) o 'id' por defecto
 */
function detectarCampoOrden(entity, model) {
    const candidateNames = ['orden', 'order', 'posicion', 'position', 'secuencia', 'sort_order'];
    if (entity?.fields && Array.isArray(entity.fields)) {
        const field = entity.fields.find(f => candidateNames.includes(f.name.toLowerCase()));
        if (field) return field.name;
    }
    if (model?.rawAttributes) {
        for (const cand of candidateNames) {
            if (model.rawAttributes[cand]) return cand;
        }
    }
    return 'id';
}

/**
 * Construye una estructura en árbol anidada a partir de una lista plana de registros
 * Agrupa registros padres con sus respectivos hijos en el arreglo 'submenus' y 'children'.
 *
 * @param {Array} records - Lista de registros Sequelize o planos
 * @param {string} parentFieldName - Nombre del campo padre (ej: 'padre_id')
 * @param {string} orderFieldName - Nombre del campo de orden (ej: 'orden')
 * @returns {Array} Arreglo con los nodos raíz (padres) y sus hijos anidados
 */
function construirArbolJerarquico(records = [], parentFieldName = 'padre_id', orderFieldName = 'orden') {
    if (!Array.isArray(records) || records.length === 0) {
        return [];
    }

    // 1. Normalizar registros a objetos planos limpios
    const plainRecords = records.map(r => {
        const item = (r && typeof r.toJSON === 'function') ? r.toJSON() : { ...r };
        item.submenus = [];
        item.children = item.submenus; // Alias de conveniencia
        return item;
    });

    // 2. Mapear cada registro por su ID para búsqueda O(1)
    const mapById = new Map();
    plainRecords.forEach(item => {
        const id = item.id !== undefined ? item.id : item.get?.('id');
        if (id !== undefined && id !== null) {
            mapById.set(Number(id), item);
            mapById.set(String(id), item);
        }
    });

    const roots = [];

    // 3. Vincular cada hijo con su padre correspondiente
    plainRecords.forEach(item => {
        const id = item.id;
        const parentVal = item[parentFieldName];

        // Se considera raíz si parentVal es nulo, indefinido, vacío o 0
        const isRoot = parentVal === null ||
                       parentVal === undefined ||
                       parentVal === '' ||
                       Number(parentVal) === 0 ||
                       String(parentVal).trim() === '0' ||
                       String(parentVal) === String(id); // Prevenir autorreferencia

        if (isRoot) {
            roots.push(item);
        } else {
            const parent = mapById.get(Number(parentVal)) || mapById.get(String(parentVal));
            if (parent && parent !== item) {
                parent.submenus.push(item);
            } else {
                // Si el padre no existe (huérfano), se ubica en raíces para no perder el elemento
                roots.push(item);
            }
        }
    });

    // 4. Función de ordenamiento
    const sortFn = (a, b) => {
        if (orderFieldName && a[orderFieldName] !== undefined && b[orderFieldName] !== undefined) {
            const orderA = Number(a[orderFieldName]);
            const orderB = Number(b[orderFieldName]);
            if (!isNaN(orderA) && !isNaN(orderB) && orderA !== orderB) {
                return orderA - orderB;
            }
        }
        return (Number(a.id) || 0) - (Number(b.id) || 0);
    };

    // 5. Ordenar recursivamente evitando ciclos
    const visited = new Set();
    function ordenarRecursivo(nodos) {
        nodos.sort(sortFn);
        nodos.forEach(nodo => {
            if (nodo && !visited.has(nodo)) {
                visited.add(nodo);
                if (Array.isArray(nodo.submenus) && nodo.submenus.length > 0) {
                    ordenarRecursivo(nodo.submenus);
                }
            }
        });
    }

    ordenarRecursivo(roots);

    return roots;
}

module.exports = {
    detectarCampoPadre,
    detectarCampoOrden,
    construirArbolJerarquico
};
