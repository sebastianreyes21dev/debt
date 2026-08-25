import { store } from '../utils/storage.js';
import { CATEGORIES } from '../utils/constants.js';
import { toast } from '../components/toast.js';
import { router } from '../utils/router.js';
import { escapeAttr, escapeHtml } from '../utils/helpers.js';

export function render(container) {
  const me = store.activeUser;
  if (!me) {
    container.innerHTML = `<div class="empty-state"><p>Agregá personas primero.</p></div>`;
    return;
  }

  const others = store.data.people.filter(p => p.id !== me.id);

  container.innerHTML = `
    <div class="page add-debt-page">
      <div class="page-header">
        <h2>Nueva Deuda</h2>
      </div>

      <form id="debt-form" class="card-form">
        <div class="form-row-2">
          <div class="form-group">
            <label for="debt-from">Quién debe</label>
            <select id="debt-from">
              ${store.data.people.map(p =>
                `<option value="${escapeAttr(p.id)}" ${p.id === me.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="debt-to">A quién</label>
            <select id="debt-to">
              ${store.data.people.map(p =>
                `<option value="${escapeAttr(p.id)}" ${p.id !== me.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="debt-amount">Monto</label>
            <div class="input-prefix">
              <span>$</span>
              <input type="number" id="debt-amount" placeholder="0" min="1" required>
            </div>
          </div>
          <div class="form-group">
            <label for="debt-category">Categoría</label>
            <select id="debt-category">
              ${CATEGORIES.map(c => `<option>${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="debt-desc">Descripción</label>
            <textarea id="debt-desc" rows="3" maxlength="500" placeholder="¿Por qué? Ej: Almuerzo, transporte, préstamo..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Guardar Deuda</button>
      </form>
    </div>`;

  container.querySelector('#debt-form').addEventListener('submit', e => {
    e.preventDefault();
    const from = container.querySelector('#debt-from').value;
    const to = container.querySelector('#debt-to').value;
    const amount = container.querySelector('#debt-amount').value;
    const category = container.querySelector('#debt-category').value;
    const desc = container.querySelector('#debt-desc').value;

    if (from === to) { toast('No podés crear una deuda contigo mismo', 'error'); return; }
    if (!amount || Number(amount) <= 0) { toast('Ingresa un monto válido', 'error'); return; }

    store.addDebt(from, to, amount, category, desc);
    toast('Deuda guardada', 'success');
    router.go('dashboard');
  });
}
