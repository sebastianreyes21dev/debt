import { supabase } from '../utils/supabase.js';
import { escapeHtml } from '../utils/helpers.js';
import { toast } from '../components/toast.js';

export async function render(container) {
  container.innerHTML = `<div class="page"><div class="page-header"><h2>Administración</h2></div><div class="empty-state"><p>Cargando usuarios…</p></div></div>`;
  const [{ data: profiles, error }, { data: datasets }] = await Promise.all([
    supabase.from('profiles').select('id, email, role, created_at').order('created_at', { ascending: false }),
    supabase.from('app_data').select('user_id, data')
  ]);
  if (error) {
    container.innerHTML = `<div class="page"><div class="empty-state"><p>No se pudieron cargar los usuarios.</p></div></div>`;
    return;
  }
  const totals = (datasets || []).reduce((sum, row) => sum + (row.data?.debts?.filter(d => !d.settled).length || 0), 0);
  container.innerHTML = `
    <div class="page">
      <div class="page-header"><h2>Administración</h2></div>
      <div class="stats-grid"><div class="stat-card stat-info"><div class="stat-label">Usuarios</div><div class="stat-value">${profiles.length}</div></div><div class="stat-card stat-neutral"><div class="stat-label">Deudas activas</div><div class="stat-value">${totals}</div></div></div>
      <section class="section"><h3 class="section-title">Usuarios y roles</h3><div class="people-list">${profiles.map(profile => `<div class="person-row"><div class="person-details"><div class="person-name">${escapeHtml(profile.email || 'Sin correo')}</div><div class="person-phone">${profile.role === 'admin' ? 'Administrador' : 'Cliente'}</div></div><select data-user="${profile.id}" class="role-select"><option value="client" ${profile.role === 'client' ? 'selected' : ''}>Cliente</option><option value="admin" ${profile.role === 'admin' ? 'selected' : ''}>Administrador</option></select></div>`).join('')}</div></section>
    </div>`;
  container.querySelectorAll('.role-select').forEach(select => select.addEventListener('change', async () => {
    const { error: updateError } = await supabase.rpc('set_user_role', { target_user_id: select.dataset.user, new_role: select.value });
    if (updateError) toast(updateError.message, 'error');
    else toast('Rol actualizado', 'success');
  }));
}
