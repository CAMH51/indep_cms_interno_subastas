export function table(header, data, container, onDelete, onUpdate, onEdit) {
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-body border-2 border-dashed border-default-medium rounded-base bg-neutral-secondary-soft">
                <i class="bi bi-inbox text-4xl mb-3 block text-neutral-400"></i>
                <p class="text-base font-semibold text-heading">No hay campos agregados todavía.</p>
                <p class="text-sm text-neutral-500 mt-1">Haz clic en el botón <strong>"Agregar campos"</strong> para definir los campos de la librería.</p>
            </div>
        `;
        return;
    }

    const defaultHeaders = [
        "Nombre",
        "Etiqueta",
        "Tipo",
        "Tamaño",
        "Decimales",
        "Unique",
        "Requerido",
        "Activo",
        "Valor Default",
        "Acciones"
    ];

    const tableHeaders = (header && header.length > 0) ? header : defaultHeaders;

    const html = `
        <div class="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
            <table class="w-full text-sm text-left rtl:text-right text-body">
                <thead class="text-xs uppercase bg-neutral-secondary-soft border-b border-default text-heading font-semibold">
                <tr>
                    ${tableHeaders.map((col) => `
                        <th scope="col" class="px-4 py-3 whitespace-nowrap">
                            ${col}
                        </th>
                    `).join('')}
                </tr>
                </thead>
                <tbody class="divide-y divide-default">
                    ${data.map((row, index) => `
                        <tr class="bg-neutral-primary hover:bg-neutral-secondary-soft/50 transition-colors" data-row-index="${index}">
                            <td class="px-4 py-3">
                                <input 
                                    class="w-full min-w-[130px] ${row.nombre_campo === 'activo' ? 'bg-neutral-tertiary cursor-not-allowed text-neutral-500' : 'bg-neutral-secondary-medium'} border border-default-medium text-heading text-sm rounded-xs px-2.5 py-1.5 focus:ring-brand focus:border-brand table-field-name" 
                                    type="text" 
                                    id="${index}_name" 
                                    name="fields[${index}][name]" 
                                    value="${row.nombre_campo ?? ''}"
                                    pattern="[a-z][a-z0-9_]{0,49}"
                                    maxlength="50"
                                    required
                                    ${row.nombre_campo === 'activo' ? 'readonly' : ''}
                                    title="${row.nombre_campo === 'activo' ? 'Campo automático del sistema (no modificable)' : 'Debe iniciar con minúscula y solo usar minúsculas, números y guión bajo (máx. 50 caracteres)'}"
                                />
                            </td>
                            <td class="px-4 py-3">
                                <input 
                                    class="w-full min-w-[130px] bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-xs px-2.5 py-1.5 focus:ring-brand focus:border-brand table-field-label" 
                                    type="text" 
                                    id="${index}_label" 
                                    name="fields[${index}][label]" 
                                    value="${row.etiqueta_campo ?? ''}"
                                    maxlength="200"
                                    required
                                    title="La etiqueta es requerida"
                                />
                            </td>
                            <td class="px-4 py-3">
                                <input 
                                    class="w-full min-w-[100px] bg-neutral-tertiary border border-transparent text-heading font-medium text-sm rounded-xs px-2.5 py-1.5 cursor-not-allowed" 
                                    type="text" 
                                    id="${index}_type" 
                                    name="fields[${index}][type]" 
                                    value="${row.tipo_campo ?? ''}" 
                                    readonly
                                />
                            </td>
                            <td class="px-4 py-3">
                                <input 
                                    class="w-20 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-xs px-2.5 py-1.5 focus:ring-brand focus:border-brand disabled:bg-neutral-tertiary disabled:border-transparent disabled:cursor-not-allowed table-field-length" 
                                    type="number" 
                                    id="${index}_length" 
                                    name="fields[${index}][length]" 
                                    min="1"
                                    max="255"
                                    value="${row.tamanio_campo ?? ''}" 
                                    ${row.tipo_campo === 'string' ? 'required' : 'disabled'}
                                />
                            </td>
                            <td class="px-4 py-3">
                                <input 
                                    class="w-20 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-xs px-2.5 py-1.5 focus:ring-brand focus:border-brand disabled:bg-neutral-tertiary disabled:border-transparent disabled:cursor-not-allowed table-field-scale" 
                                    type="number" 
                                    id="${index}_scale" 
                                    name="fields[${index}][scale]" 
                                    min="0"
                                    max="10"
                                    value="${row.decimal_campo ?? ''}"  
                                    ${row.tipo_campo === 'decimal' ? 'required' : 'disabled'}
                                />
                            </td>
                            <td class="px-4 py-3 text-center">
                                <input 
                                    class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft cursor-pointer table-field-unique" 
                                    type="checkbox" 
                                    id="${index}_unique" 
                                    name="fields[${index}][unique]" 
                                    value="on"
                                    ${row.unico_campo ? 'checked' : ''}
                                />
                            </td>
                            <td class="px-4 py-3 text-center">
                                <input 
                                    class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft cursor-pointer table-field-required" 
                                    type="checkbox" 
                                    id="${index}_required" 
                                    name="fields[${index}][required]" 
                                    value="on"
                                    ${row.requerido_campo ? 'checked' : ''}
                                />
                            </td>
                            <td class="px-4 py-3 text-center">
                                <input 
                                    class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft cursor-pointer table-field-activo" 
                                    type="checkbox" 
                                    id="${index}_activo" 
                                    name="fields[${index}][activo]" 
                                    value="on"
                                    ${row.activo_campo !== false ? 'checked' : ''}
                                />
                            </td>
                            <td class="px-4 py-3">
                                <input 
                                    class="w-full min-w-[110px] bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-xs px-2.5 py-1.5 focus:ring-brand focus:border-brand table-field-default" 
                                    type="text" 
                                    id="${index}_default" 
                                    name="fields[${index}][default]" 
                                    value="${row.default_campo ?? ''}"
                                />
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">
                                <div class="inline-flex items-center gap-1.5 justify-center">
                                    <button 
                                        type="button" 
                                        class="btn-modificar-field text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-medium rounded-base text-xs px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs" 
                                        data-index="${index}"
                                        title="Modificar configuración del campo"
                                    >
                                        <i class="bi bi-pencil-square"></i> Modificar
                                    </button>
                                    ${row.nombre_campo === 'activo' ? `
                                        <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-base bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" title="Campo automático por defecto">
                                            <i class="bi bi-shield-lock-fill"></i> Por Defecto
                                        </span>
                                    ` : `
                                        <button 
                                            type="button" 
                                            class="btn-eliminar-field text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 font-medium rounded-base text-xs px-2.5 py-1.5 inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs" 
                                            data-index="${index}"
                                            title="Eliminar campo"
                                        >
                                            <i class="bi bi-trash"></i> Eliminar
                                        </button>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    // Attach Modificar handlers
    const editButtons = container.querySelectorAll('.btn-modificar-field');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index, 10);
            if (!isNaN(idx) && typeof onEdit === 'function') {
                onEdit(idx, data[idx]);
            }
        });
    });

    // Attach Delete handlers
    const deleteButtons = container.querySelectorAll('.btn-eliminar-field');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.index, 10);
            if (!isNaN(idx) && data[idx]) {
                if (data[idx].nombre_campo === 'activo') {
                    alert('El campo "activo" es obligatorio en todas las librerías y no puede ser eliminado.');
                    return;
                }
                if (typeof onDelete === 'function') {
                    onDelete(idx);
                }
            }
        });
    });

    // Attach input sync and live validation handlers
    const validateTableDuplicateNames = () => {
        const nameInputs = container.querySelectorAll('.table-field-name');
        const counts = {};
        nameInputs.forEach(input => {
            const val = input.value.trim();
            if (val) counts[val] = (counts[val] || 0) + 1;
        });

        nameInputs.forEach(input => {
            const val = input.value.trim();
            const identRegex = /^[a-z][a-z0-9_]{0,49}$/;
            if (!val) {
                input.setCustomValidity('El nombre del campo es requerido');
            } else if (!identRegex.test(val)) {
                input.setCustomValidity('Debe iniciar con minúscula y solo usar minúsculas, números y guión bajo (máx. 50 caracteres)');
            } else if (counts[val] > 1) {
                input.setCustomValidity(`El nombre "${val}" está repetido`);
            } else {
                input.setCustomValidity('');
            }
        });
    };

    container.querySelectorAll('tbody tr').forEach(rowEl => {
        const idx = parseInt(rowEl.dataset.rowIndex, 10);
        if (isNaN(idx) || !data[idx]) return;

        const nameInp = rowEl.querySelector('.table-field-name');
        const labelInp = rowEl.querySelector('.table-field-label');
        const lengthInp = rowEl.querySelector('.table-field-length');
        const scaleInp = rowEl.querySelector('.table-field-scale');
        const uniqueInp = rowEl.querySelector('.table-field-unique');
        const reqInp = rowEl.querySelector('.table-field-required');
        const actInp = rowEl.querySelector('.table-field-activo');
        const defInp = rowEl.querySelector('.table-field-default');

        const syncRow = () => {
            if (nameInp) data[idx].nombre_campo = nameInp.value.trim();
            if (labelInp) data[idx].etiqueta_campo = labelInp.value.trim();
            if (lengthInp && !lengthInp.disabled) data[idx].tamanio_campo = lengthInp.value;
            if (scaleInp && !scaleInp.disabled) data[idx].decimal_campo = scaleInp.value;
            if (uniqueInp) data[idx].unico_campo = uniqueInp.checked;
            if (reqInp) data[idx].requerido_campo = reqInp.checked;
            if (actInp) data[idx].activo_campo = actInp.checked;
            if (defInp) data[idx].default_campo = defInp.value.trim();

            validateTableDuplicateNames();
            if (typeof onUpdate === 'function') onUpdate(data);
        };

        [nameInp, labelInp, lengthInp, scaleInp, defInp].forEach(inp => {
            if (inp) {
                inp.addEventListener('input', syncRow);
                inp.addEventListener('change', syncRow);
            }
        });

        [uniqueInp, reqInp, actInp].forEach(chk => {
            if (chk) chk.addEventListener('change', syncRow);
        });
    });

    validateTableDuplicateNames();
}