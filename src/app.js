import { store } from './utils/storage.js';
import { router } from './utils/router.js';
import { ROUTES, TAB_LABELS } from './utils/constants.js';
import { $, escapeHtml } from './utils/helpers.js';
import { isCloudEnabled, supabase } from './utils/supabase.js';

import * as Dashboard from './pages/Dashboard.js';
import * as AddDebt from './pages/AddDebt.js';
import * as History from './pages/History.js';
import * as People from './pages/People.js';
import * as Settings from './pages/Settings.js';
import * as Admin from './pages/Admin.js';
import * as Auth from './pages/Auth.js';

const pages = {
  [ROUTES.DASHBOARD]: Dashboard,
  [ROUTES.NEW_DEBT]: AddDebt,
  [ROUTES.HISTORY]: History,
  [ROUTES.PEOPLE]: People,
  [ROUTES.SETTINGS]: Settings,
  [ROUTES.ADMIN]: Admin
};

let profile = null;

function renderNav() {
  const nav = $('#main-nav');
  nav.innerHTML = Object.entries(TAB_LABELS).filter(([key]) => key !== ROUTES.ADMIN || profile?.role === 'admin').map(([key, label]) =>
    `<button class="nav-btn${router.currentRoute === key ? ' active' : ''}" data-route="${key}">${label}</button>`
  ).join('');

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => router.go(btn.dataset.route));
  });
}

function renderUserBar() {
  const bar = $('#user-bar');
  if (!store.data.people.length) {
    bar.innerHTML = '';
    return;
  }
  const me = store.activeUser;
  bar.innerHTML = `
    <div class="user-selector">
      <div class="user-avatar-sm" style="background:${me.color}">${me.name[0]}</div>
      <select id="user-select">
        ${store.data.people.map(p =>
          `<option value="${p.id}" ${p.id === me.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
        ).join('')}
      </select>
    </div>${isCloudEnabled ? '<button class="btn btn-ghost btn-sm" id="logout-btn">Salir</button>' : ''}`;

  bar.querySelector('#user-select').addEventListener('change', e => {
    store.setActiveUser(e.target.value);
    renderShell();
    router._resolve();
  });
  bar.querySelector('#logout-btn')?.addEventListener('click', () => supabase.auth.signOut());
}

function renderShell() {
  renderUserBar();
  renderNav();
}

function navigateTo(container) {
  if (router.currentRoute === ROUTES.ADMIN && profile?.role !== 'admin') {
    router.go(ROUTES.DASHBOARD);
    return;
  }
  const page = pages[router.currentRoute] || pages[ROUTES.DASHBOARD];
  page.render(container);
  renderNav();
}

document.addEventListener('DOMContentLoaded', () => {
  const content = $('#page-content');
  router.init(content);
  router.on(ROUTES.DASHBOARD, navigateTo);
  router.on(ROUTES.NEW_DEBT, navigateTo);
  router.on(ROUTES.HISTORY, navigateTo);
  router.on(ROUTES.PEOPLE, navigateTo);
  router.on(ROUTES.SETTINGS, navigateTo);

  store.on('change', () => {
    renderUserBar();
  });
  store.on('error', error => console.error('No se pudo sincronizar la información', error));

  async function start(user = null) {
    if (isCloudEnabled && !user) {
      Auth.render(content);
      return;
    }
    if (isCloudEnabled) {
      const result = await supabase.from('profiles').select('role').eq('id', user.id).single();
      profile = result.data || { role: 'client' };
      await store.initialise(user);
    }
    renderShell();
    router._resolve();
  }

  if (isCloudEnabled) {
    supabase.auth.getSession().then(({ data: { session } }) => start(session?.user));
    supabase.auth.onAuthStateChange((_event, session) => start(session?.user));
  } else {
    start();
  }
});
