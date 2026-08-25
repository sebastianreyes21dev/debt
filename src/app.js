import { store } from './utils/storage.js';
import { router } from './utils/router.js';
import { ROUTES, TAB_LABELS } from './utils/constants.js';
import { $, escapeHtml } from './utils/helpers.js';

import * as Dashboard from './pages/Dashboard.js';
import * as AddDebt from './pages/AddDebt.js';
import * as History from './pages/History.js';
import * as People from './pages/People.js';
import * as Settings from './pages/Settings.js';

const pages = {
  [ROUTES.DASHBOARD]: Dashboard,
  [ROUTES.NEW_DEBT]: AddDebt,
  [ROUTES.HISTORY]: History,
  [ROUTES.PEOPLE]: People,
  [ROUTES.SETTINGS]: Settings
};

function renderNav() {
  const nav = $('#main-nav');
  nav.innerHTML = Object.entries(TAB_LABELS).map(([key, label]) =>
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
    </div>`;

  bar.querySelector('#user-select').addEventListener('change', e => {
    store.setActiveUser(e.target.value);
    renderShell();
    router._resolve();
  });
}

function renderShell() {
  renderUserBar();
  renderNav();
}

function navigateTo(container) {
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

  renderShell();
  router._resolve();

  store.on('change', () => {
    renderUserBar();
  });
});
