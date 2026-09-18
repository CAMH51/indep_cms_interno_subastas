function formatearFecha(fecha) {
  const d = new Date(fecha);
  if (isNaN(d)) return '';
  
  const pad = (n) => String(n).padStart(2, '0');
  
  const dia    = pad(d.getDate());
  const mes    = pad(d.getMonth() + 1);
  const anio   = d.getFullYear();
  const hora   = pad(d.getHours());
  const min    = pad(d.getMinutes());
  const seg    = pad(d.getSeconds());
  
  return `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
}

function formatearFechaCorta(fecha) {
  const d = new Date(fecha);
  if (isNaN(d)) return '';
  
  const pad = (n) => String(n).padStart(2, '0');
  
  const dia    = pad(d.getDate());
  const mes    = pad(d.getMonth() + 1);
  const anio   = d.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
}

function formatearFechaCortaInvertida(fecha) {
  const d = new Date(fecha);
  if (isNaN(d)) return '';
  
  const pad = (n) => String(n).padStart(2, '0');
  
  const dia    = pad(d.getDate());
  const mes    = pad(d.getMonth() + 1);
  const anio   = d.getFullYear();
  
  return `${anio}-${mes}-${dia}`;
}

module.exports = {formatearFecha, formatearFechaCorta, formatearFechaCortaInvertida};