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

module.exports = formatearFecha;