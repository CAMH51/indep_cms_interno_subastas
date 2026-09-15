export function dataTable(idTable){
    
if (document.getElementById(idTable) && typeof simpleDatatables.DataTable !== 'undefined') {
    const dataTable = new simpleDatatables.DataTable("#"+idTable, {
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

}