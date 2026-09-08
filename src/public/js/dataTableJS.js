
export function verTabla(columnas,idTable,datos = []){
    let dataTableOptions={
            scrollX: true,
            scrollCollapse: true,
            columnDefs: [
                 { minWidth: '200px', targets: 0 },
                 { maxWidth: '600px', targets: 1 }
             ],
            columns: columnas, 
            data:datos,
            language:{
                emptyTable:'No hay registros disponibles',
                info:       'Mostrando _START_ a  _END_ de _TOTAL_ , (Página _PAGE_ de _PAGES_ Páginas)',
                infoEmpty:"Mostrando 0 a 0 de 0 registros",
                paginate: {
                    first:      'Primero',
                    last:       'Último',
                    next:       'Siguiente',
                    previous:   'Anterior'
                    },
                lengthMenu: 'Ver _MENU_ Registros por página',
                search:     'Buscar: ',
                zeroRecords:'No existe registro'
             },
            initComplete: function () {
     
            }
         };

/*          if(urlAjax){
            dataTableOptions.ajax = {
                url:urlAjax,
                type:'GET',
                dataType:'json',
                dataSrc:'data',
            };

            dataTableOptions.data = null;
         } */
    $(idTable).DataTable(dataTableOptions);

}


export function refrescarTabla(idTabla) {
    if ($.fn.DataTable.isDataTable(idTabla)) {
        var tabla = $(idTabla).DataTable();
        
        // Verificar si la tabla usa AJAX
        if (tabla.ajax && typeof tabla.ajax.reload === 'function') {
            tabla.ajax.reload(null, false); // false mantiene la página actual
        } else {
            console.warn('La tabla no está configurada con AJAX');
            // Recargar la página o hacer una recarga manual
            location.reload();
        }
    }
}
