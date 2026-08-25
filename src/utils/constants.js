export const CATEGORIES = [
  'Comida',
  'Transporte',
  'Servicios',
  'Entretenimiento',
  'Préstamo',
  'Favor',
  'Otro'
];

export const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#22c55e',
  '#06b6d4', '#f97316', '#8b5cf6', '#ef4444',
  '#14b8a6', '#e11d48', '#3b82f6', '#a855f7'
];

export const STORAGE_KEY = 'deudasapp_v2';

export const DEFAULT_PEOPLE = [
  { name: 'Sebastian', phone: '' },
  { name: 'Stefanny', phone: '' },
  { name: 'Mamá', phone: '' }
];

export const ROUTES = {
  DASHBOARD: 'dashboard',
  NEW_DEBT: 'new-debt',
  HISTORY: 'history',
  PEOPLE: 'people',
  SETTINGS: 'settings'
};

export const TAB_LABELS = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.NEW_DEBT]: 'Nueva Deuda',
  [ROUTES.HISTORY]: 'Historial',
  [ROUTES.PEOPLE]: 'Personas',
  [ROUTES.SETTINGS]: 'Ajustes'
};
