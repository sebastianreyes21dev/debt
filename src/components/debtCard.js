import { store } from '../utils/storage.js';
import { money, formatRelative, escapeHtml } from '../utils/helpers.js';
import { sendWhatsAppReminder } from '../utils/whatsapp.js';
import { toast } from './toast.js';
import { confirmDialog } from './confirmDialog.js';

export function renderDebtCard(d, currentUserId) {
  const from = store.person(d.from);
  const to = store.person(d.to);
  const isToMe = d.to === currentUserId;
  const dir = d.settled ? 'settled' : isToMe ? 'owed-to-me' : 'i-owe';

  return `
    <div class="debt-card" data-debt-id="${d.id}">
      <div class="debt-card-left">
        <div class="debt-card-avatar" style="background:${from?.color || '#666'}">${(from?.name || '?')[0]}</div>
        <div class="debt-card-info">
          <div class="debt-card-names">
            <span class="debt-from">${escapeHtml(from?.name || '?')}</span>
            <span class="debt-arrow">→</span>
            <span class="debt-to">${escapeHtml(to?.name || '?')}</span>
          </div>
          <div class="debt-card-desc">${escapeHtml(d.desc || 'Sin descripción')}</div>
          <div class="debt-card-meta">
            <span class="debt-category">${escapeHtml(d.category)}</span>
            <span class="debt-date">${formatRelative(d.date)}</span>
          </div>
        </div>
      </div>
      <div class="debt-card-right">
        <div class="debt-card-amount ${dir}">
          ${d.settled ? '✓ Pagada' : (isToMe ? '+' : '-') + money(d.amount)}
        </div>
        ${!d.settled ? `
        <div class="debt-card-actions">
          <button class="icon-btn whatsapp-btn" data-action="whatsapp" data-id="${d.id}" title="Enviar recordatorio WhatsApp">💬</button>
          <button class="icon-btn settle-btn" data-action="settle" data-id="${d.id}" title="Marcar como pagada">✓</button>
        </div>` : ''}
      </div>
    </div>`;
}

export function bindDebtCardEvents(container) {
  container.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'whatsapp') {
      const result = sendWhatsAppReminder(id);
      if (!result?.ok) toast(result.msg, 'error');
      else toast('Abriendo WhatsApp...', 'success');
    }

    if (action === 'settle') {
      const yes = await confirmDialog('¿Marcar esta deuda como pagada?');
      if (yes) {
        store.settleDebt(id);
        toast('Deuda marcada como pagada', 'success');
      }
    }
  });
}
