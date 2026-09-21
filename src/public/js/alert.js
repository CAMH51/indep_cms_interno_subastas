export function success(texto){
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: texto,
        showConfirmButton: false,
        timer: 1500
    });
}

export async function question(titulo, texto) {
  const result = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="bi bi-floppy"></i> Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#dc2626',
    reverseButtons: true
  });
  return result.isConfirmed; // true o false
}