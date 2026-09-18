(function () {
    const ttlAttr = document.body.getAttribute('data-token-ttl');
    const ttlMs = parseInt(ttlAttr, 10) || 10 * 60 * 1000; // Por defecto 10 min
    // Renovar 2 minutos antes de que expire el token
    const tiempoEspera = Math.max(ttlMs - 2 * 60 * 1000, 60 * 1000);
    function programarRenovacion() {
        setTimeout(async () => {
            try {
                const response = await fetch('/auth/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    console.log('Token de acceso renovado exitosamente.');
                    programarRenovacion(); // Reprogramar el siguiente ciclo
                } else {
                    // Si expiró o falló la sesión, redirigir al login
                    window.location.href = '/login?msg=sesion_expirada';
                }
            } catch (error) {
                console.error('Error al renovar el token:', error);
            }
        }, tiempoEspera);
    }
    if (ttlAttr) {
        programarRenovacion();
    }
})();