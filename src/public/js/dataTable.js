export function dataTable(idTable){
    try {
        if (document.getElementById(idTable) && typeof window !== 'undefined' && typeof window.simpleDatatables !== 'undefined' && window.simpleDatatables.DataTable) {
            new window.simpleDatatables.DataTable("#" + idTable, {
                searchable: true,
                sortable: true,
                perPage: 10,
                perPageSelect: [5, 10, 25],
                labels: {
                    placeholder: "Buscar...",
                    perPage: "Registros por página",
                    noRows: "No hay registros",
                    info: "Mostrando {start} a {end} de {rows} registros",
                }
            });
        }
    } catch (e) {
        console.warn('No se pudo inicializar simpleDatatables en #' + idTable, e);
    }
}