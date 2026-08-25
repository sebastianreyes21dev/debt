import { store } from '../utils/storage.js';
import { money, escapeHtml } from '../utils/helpers.js';
import { renderDebtCard, bindDebtCardEvents } from '../components/debtCard.js';
import { personSelect } from '../components/personSelect.js';

export function render(container) {
  const me = store.activeUser;
  if (!me) {
    container.innerHTML = `<div class="empty-state"><p>Agregá personas en la sección Personas para empezar.</p></div>`;
    return;
  }

  const summary = store.getUserSummary(me.id);
  const others = store.data.people.filter(p => p.id !== me.id);

  const pairCards = [];
  for (const other of others) {
    const bal = store.getBalance(me.id, other.id);
    pairCards.push({ person: other, balance: bal });
  }

  const recentDebts = summary.recent.filter(d => !d.settled).slice(0, 5);

  const totalOwedAll = store.data.debts
    .filter(d => !d.settled)
    .reduce((acc, d) => acc + d.amount, 0);

  container.innerHTML = `
    <div class="page dashboard">
      <div class="page-header">
        <h2>Hola, ${escapeHtml(me.name)}</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-negative">
          <div class="stat-label">Debés</div>
          <div class="stat-value">${money(summary.owes)}</div>
        </div>
        <div class="stat-card stat-positive">
          <div class="stat-label">Te deben</div>
          <div class="stat-value">${money(summary.owed)}</div>
        </div>
        <div class="stat-card stat-neutral">
          <div class="stat-label">Neto</div>
          <div class="stat-value">${summary.net >= 0 ? '+' : ''}${money(summary.net)}</div>
        </div>
        <div class="stat-card stat-info">
          <div class="stat-label">Activas</div>
          <div class="stat-value">${summary.total}</div>
        </div>
      </div>

      ${pairCards.length ? `
      <div class="section">
        <h3 class="section-title">Relación con otros</h3>
        <div class="pairs-grid">
          ${pairCards.map(({ person: p, balance }) => {
            const label = balance > 0
              ? `Le debés a ${p.name}`
              : balance < 0
                ? `${p.name} te debe`
                : 'En paz';
            const colorClass = balance > 0 ? 'negative' : balance < 0 ? 'positive' : 'neutral';
            return `
              <div class="pair-card">
                <div class="pair-card-avatar" style="background:${p.color}">${p.name[0]}</div>
                <div class="pair-card-name">${escapeHtml(p.name)}</div>
                <div class="pair-card-label ${colorClass}">${label}</div>
                <div class="pair-card-amount ${colorClass}">${balance === 0 ? '$0' : money(Math.abs(balance))}</div>
              </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <div class="section">
        <h3 class="section-title">Últimas pendientes</h3>
        <div class="debt-list" id="dashboard-debts">
          ${recentDebts.length
            ? recentDebts.map(d => renderDebtCard(d, me.id)).join('')
            : '<div class="empty-state"><p>No hay deudas pendientes. ¡Todo limpio!</p></div>'
          }
        </div>
      </div>
    </div>`;

  bindDebtCardEvents(container.querySelector('#dashboard-debts'));
}
