import { store } from '../utils/storage.js';
import { CATEGORIES } from '../utils/constants.js';
import { renderDebtCard, bindDebtCardEvents } from '../components/debtCard.js';
import { debounce, escapeHtml } from '../utils/helpers.js';

export function render(container) {
  const me = store.activeUser;
  if (!me) {
    container.innerHTML = `<div class="empty-state"><p>Sin datos.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="page history-page">
      <div class="page-header">
        <h2>Historial</h2>
      </div>

      <div class="filters-bar">
        <input type="search" id="history-search" placeholder="Buscar..." class="filter-search">
        <select id="history-category" class="filter-select">
          <option value="">Todas las categorías</option>
          ${CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
        </select>
        <select id="history-status" class="filter-select">
          <option value="">Todas</option>
          <option value="active">Pendientes</option>
          <option value="settled">Pagadas</option>
        </select>
      </div>

      <div class="debt-list" id="history-list"></div>
    </div>`;

  const list = container.querySelector('#history-list');
  const searchInput = container.querySelector('#history-search');
  const catSelect = container.querySelector('#history-category');
  const statusSelect = container.querySelector('#history-status');

  function refresh() {
    const search = searchInput.value;
    const category = catSelect.value;
    const status = statusSelect.value === 'active' ? false : statusSelect.value === 'settled' ? true : null;

    const debts = store.getDebtHistory(me.id, { search, category, settled: status });

    if (!debts.length) {
      list.innerHTML = `<div class="empty-state"><p>No se encontraron deudas</p></div>`;
    } else {
      list.innerHTML = debts.map(d => renderDebtCard(d, me.id)).join('');
    }
    bindDebtCardEvents(list);
  }

  searchInput.addEventListener('input', debounce(refresh, 200));
  catSelect.addEventListener('change', refresh);
  statusSelect.addEventListener('change', refresh);

  refresh();
}
