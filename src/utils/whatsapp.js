import { store } from './storage.js';
import { money } from './helpers.js';

export function sendWhatsAppReminder(debtId) {
  const d = store.data.debts.find(x => x.id === debtId);
  if (!d) return false;

  const to = store.person(d.to);
  const from = store.person(d.from);

  const phone = to?.phone?.replace(/\D/g, '');
  if (!to || !phone || phone.length < 8 || phone.length > 15) {
    return { ok: false, msg: `${to?.name || 'La persona'} no tiene teléfono registrado. Edítalo en Personas.` };
  }

  const msg = [
    `Hola ${to.name} 👋`,
    ``,
    `${from.name} te recuerda que le debes ${money(d.amount)}.`,
    ``,
    `📌 ${d.category}`,
    d.desc ? `💬 ${d.desc}` : '',
    ``,
    `¡Cuando puedas lo arreglamos! 😊`
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  return { ok: true };
}
