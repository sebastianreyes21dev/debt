import { STORAGE_KEY, COLORS, DEFAULT_PEOPLE, CATEGORIES } from './constants.js';
import { uid } from './helpers.js';
import { isCloudEnabled, supabase } from './supabase.js';

const emptyData = () => ({ people: [], debts: [], settings: { activeUserId: null } });
const text = (value, max = 200) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validTime = value => Number.isFinite(value) && value > 0 ? value : Date.now();

class EventBus {
  constructor() { this._h = {}; }
  on(e, fn) { (this._h[e] ??= []).push(fn); }
  off(e, fn) { this._h[e] = (this._h[e] || []).filter(f => f !== fn); }
  emit(e, d) { (this._h[e] || []).forEach(fn => fn(d)); }
}

export class Store extends EventBus {
  constructor() {
    super();
    this.user = null;
    this.data = isCloudEnabled ? emptyData() : this._load();
    if (!isCloudEnabled && !this.data.people.length) this._seed();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? this._normaliseData(JSON.parse(raw)) : emptyData();
    } catch {
      return emptyData();
    }
  }

  _normaliseData(parsed) {
    if (!parsed || !Array.isArray(parsed.people) || !Array.isArray(parsed.debts)) return emptyData();

    const people = [];
    const ids = new Set();
    parsed.people.forEach((item, index) => {
      const name = text(item?.name, 80);
      const id = text(item?.id, 80);
      if (!name || !id || ids.has(id)) return;
      ids.add(id);
      people.push({
        id,
        name,
        phone: text(item.phone, 24),
        color: COLORS.includes(item.color) ? item.color : COLORS[index % COLORS.length],
        createdAt: validTime(item.createdAt)
      });
    });

    const debts = [];
    const debtIds = new Set();
    parsed.debts.forEach(item => {
      const id = text(item?.id, 80);
      const amount = Number(item?.amount);
      if (!id || debtIds.has(id) || !ids.has(item?.from) || !ids.has(item?.to) || item.from === item.to || !Number.isFinite(amount) || amount <= 0) return;
      debtIds.add(id);
      debts.push({
        id,
        from: item.from,
        to: item.to,
        amount,
        category: CATEGORIES.includes(item.category) ? item.category : 'Otro',
        desc: text(item.desc, 500),
        date: validTime(item.date),
        settled: Boolean(item.settled),
        settledAt: item.settled ? validTime(item.settledAt) : null
      });
    });

    const activeUserId = ids.has(parsed.settings?.activeUserId) ? parsed.settings.activeUserId : people[0]?.id || null;
    return { people, debts, settings: { activeUserId } };
  }

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.emit('change', this.data);
    if (isCloudEnabled && this.user) {
      supabase.from('app_data').upsert({ user_id: this.user.id, data: this.data, updated_at: new Date().toISOString() })
        .then(({ error }) => { if (error) this.emit('error', error); });
    }
  }

  async initialise(user) {
    this.user = user;
    if (!isCloudEnabled) return;
    const { data, error } = await supabase.from('app_data').select('data').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    this.data = data?.data ? this._normaliseData(data.data) : emptyData();
    if (!this.data.people.length) this._seed();
    else this._save();
  }

  _seed() {
    DEFAULT_PEOPLE.forEach((p, i) => {
      this.data.people.push({
        id: uid(),
        name: p.name,
        phone: p.phone,
        color: COLORS[i % COLORS.length],
        createdAt: Date.now()
      });
    });
    if (this.data.people.length) {
      this.data.settings.activeUserId = this.data.people[0].id;
    }
    this._save();
  }

  get activeUser() {
    return this.person(this.data.settings.activeUserId) || this.data.people[0];
  }

  setActiveUser(id) {
    this.data.settings.activeUserId = id;
    this._save();
  }

  person(id) {
    return this.data.people.find(p => p.id === id);
  }

  addPerson(name, phone) {
    const cleanName = text(name, 80);
    if (!cleanName) return null;
    const p = {
      id: uid(),
      name: cleanName,
      phone: text(phone, 24),
      color: COLORS[this.data.people.length % COLORS.length],
      createdAt: Date.now()
    };
    this.data.people.push(p);
    if (this.data.people.length === 1) this.data.settings.activeUserId = p.id;
    this._save();
    return p;
  }

  updatePerson(id, name, phone) {
    const p = this.person(id);
    if (!p) return;
    const cleanName = text(name, 80);
    if (!cleanName) return;
    p.name = cleanName;
    p.phone = text(phone, 24);
    this._save();
    return p;
  }

  removePerson(id) {
    this.data.people = this.data.people.filter(p => p.id !== id);
    this.data.debts = this.data.debts.filter(d => d.from !== id && d.to !== id);
    if (this.data.settings.activeUserId === id) {
      this.data.settings.activeUserId = this.data.people[0]?.id || null;
    }
    this._save();
  }

  addDebt(from, to, amount, category, desc) {
    const numericAmount = Number(amount);
    if (!this.person(from) || !this.person(to) || from === to || !Number.isFinite(numericAmount) || numericAmount <= 0) return null;
    const d = {
      id: uid(),
      from,
      to,
      amount: numericAmount,
      category: CATEGORIES.includes(category) ? category : 'Otro',
      desc: text(desc, 500),
      date: Date.now(),
      settled: false,
      settledAt: null
    };
    this.data.debts.push(d);
    this._save();
    return d;
  }

  settleDebt(id) {
    const d = this.data.debts.find(x => x.id === id);
    if (d) { d.settled = true; d.settledAt = Date.now(); this._save(); }
    return d;
  }

  deleteDebt(id) {
    this.data.debts = this.data.debts.filter(d => d.id !== id);
    this._save();
  }

  getDebtsBetween(a, b) {
    return this.data.debts
      .filter(d => (d.from === a && d.to === b) || (d.from === b && d.to === a))
      .sort((x, y) => y.date - x.date);
  }

  getBalance(a, b) {
    let bal = 0;
    this.data.debts.forEach(d => {
      if (d.settled) return;
      if (d.from === a && d.to === b) bal += d.amount;
      if (d.from === b && d.to === a) bal -= d.amount;
    });
    return bal;
  }

  getUserSummary(userId) {
    const active = this.data.debts.filter(d => !d.settled && (d.from === userId || d.to === userId));
    let owes = 0, owed = 0;
    active.forEach(d => {
      if (d.from === userId) owes += d.amount;
      else owed += d.amount;
    });
    const recent = this.data.debts
      .filter(d => d.from === userId || d.to === userId)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
    return { owes, owed, net: owed - owes, active, recent, total: active.length };
  }

  getDebtHistory(userId, { search = '', category = '', settled = null } = {}) {
    return this.data.debts
      .filter(d => d.from === userId || d.to === userId)
      .filter(d => {
        if (search) {
          const s = search.toLowerCase();
          const other = d.from === userId ? this.person(d.to)?.name : this.person(d.from)?.name;
          return (d.desc || '').toLowerCase().includes(s) ||
                 (other || '').toLowerCase().includes(s) ||
                 d.category.toLowerCase().includes(s);
        }
        return true;
      })
      .filter(d => !category || d.category === category)
      .filter(d => settled === null || d.settled === settled)
      .sort((a, b) => b.date - a.date);
  }

  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(json) {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.people) || !Array.isArray(parsed.debts)) return false;
      this.data = this._normaliseData(parsed);
      this._save();
      return true;
    } catch {}
    return false;
  }

  clearAll() {
    this.data = { people: [], debts: [], settings: { activeUserId: null } };
    this._save();
  }
}

export const store = new Store();
