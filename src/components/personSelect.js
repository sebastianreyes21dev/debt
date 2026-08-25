import { store } from '../utils/storage.js';
import { escapeAttr, escapeHtml } from '../utils/helpers.js';

export function personSelect(id, selectedId, { exclude = null, label = '' } = {}) {
  const people = exclude ? store.data.people.filter(p => p.id !== exclude) : store.data.people;
  return `
    <select id="${escapeAttr(id)}">
      ${label ? `<option value="">${label}</option>` : ''}
      ${people.map(p =>
        `<option value="${escapeAttr(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
      ).join('')}
    </select>`;
}
