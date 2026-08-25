import { ROUTES } from './constants.js';
import { $ } from './helpers.js';

class Router {
  constructor() {
    this.routes = {};
    this.current = null;
    this.container = null;
  }

  init(container) {
    this.container = container;
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  }

  on(name, renderFn) {
    this.routes[name] = renderFn;
  }

  go(name) {
    window.location.hash = name;
  }

  _resolve() {
    const hash = (window.location.hash.slice(1) || ROUTES.DASHBOARD).toLowerCase();
    const fn = this.routes[hash] || this.routes[ROUTES.DASHBOARD];
    if (fn && this.container) {
      this.current = hash;
      fn(this.container);
    }
  }

  get currentRoute() {
    return this.current || ROUTES.DASHBOARD;
  }
}

export const router = new Router();
