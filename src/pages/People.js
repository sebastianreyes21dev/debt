import { store } from '../utils/storage.js';
import { escapeAttr, escapeHtml } from '../utils/helpers.js';
import { open, close } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { confirmDialog } from '../components/confirmDialog.js';

function showPersonForm(edit = null) {
  open(`
    <h3 class="modal-title">${edit ? 'Editar' : 'Nueva'} Persona</h3>
    <form id="person-form" class="card-form">
      <div class="form-group">
        <label for="p-name">Nombre</label>
        <input type="text" id="p-name" value="${escapeAttr(edit?.name)}" maxlength="80" required>
      </div>
      <div class="form-group">
        <label for="p-phone">Teléfono (con código país, ej: 573001234567)</label>
        <input type="tel" id="p-phone" value="${escapeAttr(edit?.phone)}" maxlength="24" placeholder="573...">
      </div>
      <button type="submit" class="btn btn-primary btn-block">Guardar</button>
    </form>
  `);

  document.querySelector('#person-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.querySelector('#p-name').value.trim();
    const phone = document.querySelector('#p-phone').value.trim();
    if (!name) return;

    if (edit) {
      store.updatePerson(edit.id, name, phone);
      toast('Persona actualizada', 'success');
    } else {
      store.addPerson(name, phone);
      toast('Persona agregada', 'success');
    }
    close();
    render(document.querySelector('#page-content'));
  });
}

export function render(container) {
  const people = store.data.people;

  container.innerHTML = `
    <div class="page people-page">
      <div class="page-header">
        <h2>Personas</h2>
        <button class="btn btn-primary btn-sm" id="add-person-btn">+ Agregar</button>
      </div>

      <div class="people-list">
        ${people.length ? people.map(p => `
          <div class="person-row">
            <div class="person-row-left">
              <div class="person-avatar" style="background:${p.color}">${p.name[0]}</div>
              <div class="person-details">
                <div class="person-name">${escapeHtml(p.name)}</div>
                <div class="person-phone">${escapeHtml(p.phone || 'Sin teléfono')}</div>
              </div>
            </div>
            <div class="person-row-actions">
              <button class="icon-btn" data-edit="${p.id}" title="Editar">✏️</button>
              <button class="icon-btn icon-btn-danger" data-remove="${p.id}" title="Eliminar">🗑️</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state"><p>Agregá personas para empezar.</p></div>'}
      </div>
    </div>`;

  container.querySelector('#add-person-btn')?.addEventListener('click', () => showPersonForm());

  container.addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      const p = store.person(editBtn.dataset.edit);
      if (p) showPersonForm(p);
    }

    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      const p = store.person(removeBtn.dataset.remove);
      if (p) {
        const yes = await confirmDialog(`¿Eliminar a ${p.name}? Se borrarán todas sus deudas.`);
        if (yes) {
          store.removePerson(p.id);
          toast(`${p.name} eliminado/a`, 'success');
          render(container);
        }
      }
    }
  });
}
