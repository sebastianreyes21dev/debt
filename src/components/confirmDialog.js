import * as Modal from './modal.js';
import { escapeHtml } from '../utils/helpers.js';

export function confirmDialog(msg) {
  return new Promise(resolve => {
    Modal.open(`
      <div class="confirm-dialog">
        <p>${escapeHtml(msg)}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" data-confirm="no">Cancelar</button>
          <button class="btn btn-primary" data-confirm="yes">Confirmar</button>
        </div>
      </div>
    `);
    document.querySelector('[data-confirm="no"]').addEventListener('click', () => { Modal.close(); resolve(false); });
    document.querySelector('[data-confirm="yes"]').addEventListener('click', () => { Modal.close(); resolve(true); });
  });
}
