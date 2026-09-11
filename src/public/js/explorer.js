// ==========================================
  // NOTIFICACIÓN TOAST
  // ==========================================
 const toast = document.getElementById('toastNotification');
const toastMsg = document.getElementById('toastMessage');

export function showToast(message) {
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;

  // 1. Hacer visible el contenedor (sin transición aún)
  toast.classList.remove('hidden');
  toast.classList.add('flex');

  // 2. Forzar reflow para que el navegador registre el cambio y aplique la transición
  void toast.offsetWidth;

  // 3. Aplicar estado visible con transición
  toast.classList.remove('opacity-0', 'translate-y-2');
  toast.classList.add('opacity-100', 'translate-y-0');

  // 4. Auto-ocultar
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');

    // 5. Ocultar completamente después de la transición
    toast._hideTransition = setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('flex');
    }, 200);
  }, 3200);
}

  // ==========================================
  // COPIAR AL PORTAPAPELES (URL FIJA)
  // ==========================================
  export function copyToClipboard(text, customMsg = '¡Enlace permanente copiado al portapapeles!'){
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(customMsg);
      });
    } else {
      // Fallback para contextos no seguros
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(customMsg);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // ==========================================
  // GESTIÓN DE MODALES (Tailwind: hidden <-> flex)
  // ==========================================
  export function openModal(modalId){
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      const input = modal.querySelector('input[type="text"]');
      if (input) setTimeout(() => input.focus(), 100);
    }
  };

  export function closeModal(modalId){
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // Cerrar al presionar Escape o clic fuera del modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // ya no usamos '.active': buscamos los que están visibles (con 'flex')
      document.querySelectorAll('.modal-backdrop.flex').forEach((m) => {
        m.classList.add('hidden');
        m.classList.remove('flex');
      });
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
        backdrop.classList.remove('flex');
      }
    });
  });

  // Modal para Renombrar Carpeta
  export function openRenameFolderModal(id, currentName, currentColor){
    const form = document.getElementById('renameFolderForm');
    const input = document.getElementById('renameFolderNameInput');
    if (form && input) {
      form.action = `/folders/${id}/update`;
      input.value = currentName;
      openModal('renameFolderModal');
    }
  };

  // Modal para Renombrar Archivo
  export function openRenameFileModal(id, currentName){
    const form = document.getElementById('renameFileForm');
    const input = document.getElementById('renameFileNameInput');
    if (form && input) {
      form.action = `/files/${id}/rename`;
      input.value = currentName;
      openModal('renameFileModal');
    }
  };

  // ==========================================
  // SELECTOR DE COLOR PARA CARPETAS (Tailwind: clases de "ring")
  // ==========================================
  const colorOptions = document.querySelectorAll('.color-option');
  const folderColorInput = document.getElementById('folderColorInput');

  // Clases que representan "seleccionado" vs "no seleccionado"
  const SELECTED_CLASSES = ['ring-gray-900', 'scale-110'];
  const UNSELECTED_CLASSES = ['ring-transparent', 'hover:ring-gray-300'];

  colorOptions.forEach((option) => {
    option.addEventListener('click', () => {
      colorOptions.forEach((opt) => {
        opt.classList.remove(...SELECTED_CLASSES);
        opt.classList.add(...UNSELECTED_CLASSES);
      });
      option.classList.remove(...UNSELECTED_CLASSES);
      option.classList.add(...SELECTED_CLASSES);
      if (folderColorInput) {
        folderColorInput.value = option.dataset.color;
      }
    });
  });

  // ==========================================
  // DRAG & DROP Y SUBIDA DE ARCHIVOS (Tailwind: estado "dragover")
  // ==========================================
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileUploadInput');
  const uploadForm = document.getElementById('uploadFilesForm');

  // Clases aplicadas mientras se arrastra un archivo sobre la zona
  const DRAGOVER_CLASSES = ['border-cyan-500', 'bg-cyan-50'];

  if (dropzone && fileInput && uploadForm) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add(...DRAGOVER_CLASSES);
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove(...DRAGOVER_CLASSES);
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        fileInput.files = files;
        uploadForm.submit();
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        uploadForm.submit();
      }
    });
  }

  // ==========================================
  // FILTRADO / BÚSQUEDA EN TIEMPO REAL
  // ==========================================
  const searchInput = document.getElementById('searchExplorerInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();

      const folderCards = document.querySelectorAll('.folder-card');
      const fileCards = document.querySelectorAll('.file-card');

      folderCards.forEach((card) => {
        const name = card.querySelector('.folder-name')?.textContent.toLowerCase() || '';
        // usamos 'hidden' de Tailwind en vez de manipular style.display directamente
        card.classList.toggle('hidden', !name.includes(term));
      });

      fileCards.forEach((card) => {
        const name = card.querySelector('.file-name')?.textContent.toLowerCase() || '';
        card.classList.toggle('hidden', !name.includes(term));
      });
    });
  }