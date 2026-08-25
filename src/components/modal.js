import { $ } from '../utils/helpers.js';

let overlay = null;

function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay hidden';
  overlay.innerHTML = `<div class="modal-box"><button class="modal-close-btn" aria-label="Cerrar">&times;</button><div class="modal-body"></div></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('.modal-close-btn').addEventListener('click', close);
}

export function open(html) {
  ensureOverlay();
  overlay.querySelector('.modal-body').innerHTML = html;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function close() {
  if (!overlay) return;
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}
