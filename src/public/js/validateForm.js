    // ════════════════════════════════════════════════════════════════════
//  FUNCIÓN GLOBAL: validate({ name, validate })
//  Retorna: { valid: boolean, error: string | null }
// ════════════════════════════════════════════════════════════════════

export function validate({ name, validate: rules }) {
  const input = document.querySelector(`[name="${name}"]`);
  if (!input) return console.warn(`validate: no existe [name="${name}"]`);

  const value    = input.value.trim();
  const ruleList = rules.split('|');
  const field    = input.closest('.field');
  const msgEl    = field?.querySelector('.msg');

  const setUI = (ok, msg = '') => {
    //input.className = ok ? 'form-control is-valid' : (msg ? 'form-control is-error' : '');
    if (msgEl) { msgEl.innerHTML = msg; msgEl.className = 'msg ' + (ok ? 'ok' : ' text-[#9b2247] font-bold p-1'); }
    return { valid: ok, error: ok ? null : msg };
  };

  for (const rule of ruleList) {
    const [ruleName, param] = rule.split(':');

    switch (ruleName.trim()) {

      case 'required':
        if (validator.isEmpty(value))
          return setUI(false, `<i class="bi bi-exclamation-circle"></i> El campo es requerido.`);
        break;

      case 'identifier': {
        const identRegex = /^[a-z][a-z0-9_]{0,49}$/;
        if (!validator.isEmpty(value) && !identRegex.test(value))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Debe iniciar con minúscula y contener solo minúsculas, números y guión bajo (máx. 50 caracteres).');
        break;
      }

      case 'regex':
      case 'pattern': {
        if (!validator.isEmpty(value)) {
          const reg = new RegExp(param);
          if (!reg.test(value))
            return setUI(false, '<i class="bi bi-exclamation-circle"></i> Formato no válido.');
        }
        break;
      }

      case 'email':
        if (!validator.isEmpty(value) && !validator.isEmail(value))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Ingresa un correo electrónico válido.');
        break;

      case 'url':
        if (!validator.isEmpty(value) && !validator.isURL(value, { require_protocol: true }))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Ingresa una URL válida (con https://).');
        break;

      case 'alpha':
        if (!validator.isEmpty(value) && !validator.isAlpha(value, 'es-ES'))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Solo se permiten letras.');
        break;

      case 'numeric':
        if (!validator.isEmpty(value) && !validator.isNumeric(value))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Solo se permiten números.');
        break;

      case 'integer':
        if (!validator.isEmpty(value) && !validator.isInt(value))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Debe ser un número entero.');
        break;

      case 'min':
        if (!validator.isEmpty(value) && !validator.isLength(value, { min: parseInt(param) }))
          return setUI(false, `<i class="bi bi-exclamation-circle"></i> Mínimo ${param} caracteres.`);
        break;

      case 'max':
        if (!validator.isEmpty(value) && !validator.isLength(value, { max: parseInt(param) }))
          return setUI(false, `<i class="bi bi-exclamation-circle"></i> Máximo ${param} caracteres.`);
        break;

      case 'length':
        if (!validator.isEmpty(value) && !validator.isLength(value, { min: parseInt(param), max: parseInt(param) }))
          return setUI(false, `<i class="bi bi-exclamation-circle"></i> Debe tener exactamente ${param} caracteres.`);
        break;

      case 'between': {
        const [min, max] = param.split(',').map(Number);
        if (!validator.isEmpty(value) && !validator.isFloat(value, { min, max }))
          return setUI(false, `<i class="bi bi-exclamation-circle"></i> El valor debe estar entre ${min} y ${max}.`);
        break;
      }

      case 'strong_password':
        if (!validator.isEmpty(value) && !validator.isStrongPassword(value, { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 0 }))
          return setUI(false, '<i class="bi bi-exclamation-circle"></i> Mín. 8 caracteres, 1 mayúscula y 1 número.');
        break;

      // ─── TAMAÑO DE ARCHIVO ───────────────────────────────────────────
      // Uso: validate({ name: 'foto', validate: 'file_max:2' })  → máx 2 MB
      case 'file_max': {
        const file = input.files?.[0];
        if (file) {
          const mb = file.size / (1024 * 1024);
          if (mb > parseFloat(param))
            return setUI(false, `<i class="bi bi-exclamation-circle"></i> El archivo no debe superar ${param} MB.`);
        }
        break;
      }

      // Uso: validate({ name: 'foto', validate: 'file_min:0.5' }) → mín 0.5 MB
      case 'file_min': {
        const file = input.files?.[0];
        if (file) {
          const mb = file.size / (1024 * 1024);
          if (mb < parseFloat(param))
            return setUI(false, `<i class="bi bi-exclamation-triangle"></i> El archivo debe pesar al menos ${param} MB.`);
        }
        break;
      }

      // ─── TIPO DE ARCHIVO ─────────────────────────────────────────────
      // Uso: validate({ name: 'foto', validate: 'file_type:image/png,image/jpeg' })
      case 'file_type': {
        const file = input.files?.[0];
        if (file) {
          const allowed = param.split(',').map(t => t.trim());
          if (!allowed.includes(file.type))
            return setUI(false, `<i class="bi bi-exclamation-triangle"></i> Tipo no permitido. Acepta: ${param}.`);
        }
        break;
      }

      // ─── FECHA NO PUEDE SER PASADA ────────────────────────────────────
      // Uso: validate({ name: 'fecha', validate: 'date_future' })
      case 'date_future': {
        if (!validator.isEmpty(value)) {
          const selected = new Date(value);
          const today    = new Date();
          today.setHours(0, 0, 0, 0);           // ignora la hora
          if (selected < today)
            return setUI(false, '<i class="bi bi-exclamation-triangle"></i> La fecha no puede ser un día pasado.');
        }
        break;
      }

      // ─── FECHA MÁXIMA RELATIVA A OTRO CAMPO ──────────────────────────
      // Uso: validate({ name: 'fecha_fin', validate: 'date_after:fecha_inicio' })
      // → fecha_fin debe ser POSTERIOR a fecha_inicio
      case 'date_after': {
        if (!validator.isEmpty(value)) {
          const ref = document.querySelector(`[name="${param}"]`);
          if (ref && ref.value) {
            if (new Date(value) <= new Date(ref.value))
              return setUI(false, `<i class="bi bi-exclamation-triangle"></i> Debe ser posterior al campo "${param}".`);
          }
        }
        break;
      }

      // Uso: validate({ name: 'fecha_inicio', validate: 'date_before:fecha_fin' })
      // → fecha_inicio debe ser ANTERIOR a fecha_fin
      case 'date_before': {
        if (!validator.isEmpty(value)) {
          const ref = document.querySelector(`[name="${param}"]`);
          if (ref && ref.value) {
            if (new Date(value) >= new Date(ref.value))
              return setUI(false, `<i class="bi bi-exclamation-triangle"></i> Debe ser anterior al campo "${param}".`);
          }
        }
        break;
      }

      // ─── XOR: uno u otro, pero no ambos ──────────────────────────────
      // Uso: validate({ name: 'email', validate: 'xor:telefono' })
      // → solo uno de los dos puede estar lleno
      case 'xor': {
          const other      = document.querySelector(`[name="${param}"]`);
          const otherValue = other?.value.trim() ?? '';
          const bothFilled = !validator.isEmpty(value) && !validator.isEmpty(otherValue);

          if (bothFilled)
            return setUI(false, `<i class="bi bi-exclamation-triangle"></i> Solo puedes llenar "${name}" o "${param}", no ambos.`);

          // Si ninguno tiene dato → no se valida nada, campo neutral
          return setUI(true, '');
        }
      default:
        console.warn(`validate: regla desconocida → "${ruleName}"`);
    }
  }

  return setUI(true, '');
};

// ════════════════════════════════════════════════════════════════════
//  FUNCIÓN GLOBAL: validateAll([ { name, validate }, ... ])
//  Retorna: { valid: boolean, errors: { [name]: string } }
// ════════════════════════════════════════════════════════════════════
export function validateAll(fields){
  const errors = {};
  for (const field of fields) {
    const result = validate(field);
    if (result && !result.valid) errors[field.name] = result.error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
