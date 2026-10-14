/* export function selectTipoDato(selectElement, idcontainer) {
    document.getElementById(selectElement).addEventListener('change', function() {
        const selectedValue = this.value;// Muestra el valor seleccionado en un alert
        const container = document.getElementById(idcontainer);
        
        // Buscar el template en el objeto templates pasado como parámetro
        const template = document.getElementById(`field_${selectedValue}`);
        
        if (template) {
            container.innerHTML = '';
            container.appendChild(template.content.cloneNode(true));
        } else {
            container.innerHTML = '';
        }
    });
} */

export function selectTipoDato(selectElement) {
    const el = document.getElementById(selectElement);
    if (!el) return;

    el.addEventListener('change', function() {
        const selectedValue = this.value;
        const tamanio = document.getElementById('tamanio_campo');
        const decimal = document.getElementById('decimal_campo');

        if (selectedValue === 'string') {
            if (tamanio) {
                tamanio.disabled = false;
                if (!tamanio.value) tamanio.value = '255';
            }
            if (decimal) {
                decimal.disabled = true;
                decimal.value = '';
            }
        } else if (selectedValue === 'decimal') {
            if (tamanio) {
                tamanio.disabled = true;
                tamanio.value = '';
            }
            if (decimal) {
                decimal.disabled = false;
                if (!decimal.value) decimal.value = '2';
            }
        } else {
            if (tamanio) {
                tamanio.disabled = true;
                tamanio.value = '';
            }
            if (decimal) {
                decimal.disabled = true;
                decimal.value = '';
            }
        }
    });
}

export function getDataField() {
    const tipo = document.getElementById('tipo_campo');
    const nombre = document.getElementById('nombre_campo');
    const etiqueta = document.getElementById('etiqueta_campo');
    const unique = document.getElementById('unique');
    const requerido = document.getElementById('requerido');
    const activo = document.getElementById('activo');
    const defaultCampo = document.getElementById('default_campo');
    const tamanio = document.getElementById('tamanio_campo');
    const decimal = document.getElementById('decimal_campo');

    const data = {
        tipo_campo: tipo ? tipo.value : '',
        nombre_campo: nombre ? nombre.value.trim() : '',
        etiqueta_campo: etiqueta ? etiqueta.value.trim() : '',
        unico_campo: unique ? unique.checked : false,
        requerido_campo: requerido ? requerido.checked : false,
        activo_campo: activo ? activo.checked : true,
        default_campo: defaultCampo && defaultCampo.value.trim() ? defaultCampo.value.trim() : null,
        tamanio_campo: tamanio && !tamanio.disabled && tamanio.value ? tamanio.value : null,
        decimal_campo: decimal && !decimal.disabled && decimal.value ? decimal.value : null
    };
    return data;
}

export function setModalEditField(index, fieldData) {
    const editIndexEl = document.getElementById('edit_field_index');
    if (editIndexEl) editIndexEl.value = index;

    const nombre = document.getElementById('nombre_campo');
    const etiqueta = document.getElementById('etiqueta_campo');
    const tipo = document.getElementById('tipo_campo');
    const tamanio = document.getElementById('tamanio_campo');
    const decimal = document.getElementById('decimal_campo');
    const unique = document.getElementById('unique');
    const requerido = document.getElementById('requerido');
    const activo = document.getElementById('activo');
    const defaultCampo = document.getElementById('default_campo');

    if (nombre) nombre.value = fieldData.nombre_campo || '';
    if (etiqueta) etiqueta.value = fieldData.etiqueta_campo || '';
    if (tipo) {
        tipo.value = fieldData.tipo_campo || '';
        tipo.dispatchEvent(new Event('change'));
    }

    if (tamanio && !tamanio.disabled) {
        tamanio.value = fieldData.tamanio_campo || (fieldData.tipo_campo === 'string' ? '255' : '');
    }
    if (decimal && !decimal.disabled) {
        decimal.value = (fieldData.decimal_campo !== null && fieldData.decimal_campo !== undefined && fieldData.decimal_campo !== '') 
            ? fieldData.decimal_campo : '2';
    }

    if (unique) unique.checked = Boolean(fieldData.unico_campo);
    if (requerido) requerido.checked = Boolean(fieldData.requerido_campo);
    if (activo) activo.checked = fieldData.activo_campo !== false;
    if (defaultCampo) defaultCampo.value = fieldData.default_campo || '';

    // Actualizar título del modal y botón
    const modalEl = document.getElementById('agregar_campo');
    if (modalEl) {
        const titleEl = modalEl.querySelector('h3');
        if (titleEl) {
            titleEl.innerHTML = '<i class="bi bi-pencil-square text-2xl"></i> MODIFICAR CAMPO';
        }
    }
    const btnSubmit = document.getElementById('btn_agregar_campo');
    if (btnSubmit) {
        btnSubmit.innerHTML = '<i class="bi bi-check2-circle"></i> Guardar Cambios';
        btnSubmit.title = 'Guardar Cambios';
    }

    const modalForm = document.getElementById('form_campo');
    if (modalForm) {
        modalForm.querySelectorAll('.msg').forEach(msg => {
            msg.innerHTML = '';
            msg.className = 'msg';
        });
    }
}

export function resetModalForm() {
    const editIndexEl = document.getElementById('edit_field_index');
    if (editIndexEl) editIndexEl.value = "";

    const nombre = document.getElementById('nombre_campo');
    const etiqueta = document.getElementById('etiqueta_campo');
    const tipo = document.getElementById('tipo_campo');
    const tamanio = document.getElementById('tamanio_campo');
    const decimal = document.getElementById('decimal_campo');
    const unique = document.getElementById('unique');
    const requerido = document.getElementById('requerido');
    const activo = document.getElementById('activo');
    const defaultCampo = document.getElementById('default_campo');

    if (nombre) nombre.value = "";
    if (etiqueta) etiqueta.value = "";
    if (tipo) {
        tipo.value = "";
        tipo.dispatchEvent(new Event('change'));
    }
    if (tamanio) { tamanio.value = ""; tamanio.disabled = true; }
    if (decimal) { decimal.value = ""; decimal.disabled = true; }
    if (unique) unique.checked = false;
    if (requerido) requerido.checked = false;
    if (activo) activo.checked = true;
    if (defaultCampo) defaultCampo.value = "";

    const modalEl = document.getElementById('agregar_campo');
    if (modalEl) {
        const titleEl = modalEl.querySelector('h3');
        if (titleEl) {
            titleEl.innerHTML = '<i class="bi bi-plus-circle text-2xl"></i> AGREGAR CAMPO REQUERIDO';
        }
    }
    const btnSubmit = document.getElementById('btn_agregar_campo');
    if (btnSubmit) {
        btnSubmit.innerHTML = '<i class="bi bi-plus-circle"></i> Agregar Campo';
        btnSubmit.title = 'Agregar Campo';
    }

    const modalForm = document.getElementById('form_campo');
    if (modalForm) {
        modalForm.querySelectorAll('.msg').forEach(msg => {
            msg.innerHTML = '';
            msg.className = 'msg';
        });
    }
}

