import { store } from '../utils/storage.js';
import { toast } from '../components/toast.js';
import { confirmDialog } from '../components/confirmDialog.js';
import { open, close } from '../components/modal.js';

export function render(container) {
  container.innerHTML = `
    <div class="page settings-page">
      <div class="page-header">
        <h2>Ajustes</h2>
      </div>

      <div class="settings-section">
        <h3 class="section-title">Datos</h3>
        <div class="settings-group">
          <button class="btn btn-outline btn-block" id="export-btn">📥 Exportar datos (JSON)</button>
          <button class="btn btn-outline btn-block" id="import-btn">📤 Importar datos</button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">Peligro</h3>
        <div class="settings-group">
          <button class="btn btn-danger btn-block" id="clear-btn">🗑️ Borrar todo</button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">Info</h3>
        <p class="settings-info">DeudasApp v1.0 — Datos guardados localmente en este navegador.</p>
      </div>
    </div>`;

  container.querySelector('#export-btn').addEventListener('click', () => {
    const json = store.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deudasapp_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Datos exportados', 'success');
  });

  container.querySelector('#import-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const text = await file.text();
      if (store.importData(text)) {
        toast('Datos importados correctamente', 'success');
        render(container);
      } else {
        toast('Archivo inválido', 'error');
      }
    };
    input.click();
  });

  container.querySelector('#clear-btn').addEventListener('click', async () => {
    const yes = await confirmDialog('¿Borrar TODOS los datos? Esta acción no se puede deshacer.');
    if (yes) {
      store.clearAll();
      toast('Todos los datos fueron borrados', 'success');
      setTimeout(() => location.reload(), 500);
    }
  });
}
