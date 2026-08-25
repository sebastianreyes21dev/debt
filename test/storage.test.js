import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
}

globalThis.localStorage = new MemoryStorage();
const { Store } = await import('../src/utils/storage.js');

test('el resumen asigna correctamente lo que debo y lo que me deben', () => {
  const store = new Store();
  const [me, other] = store.data.people;
  store.addDebt(me.id, other.id, 15000, 'Comida', 'Almuerzo');
  store.addDebt(other.id, me.id, 8000, 'Favor', 'Taxi');
  const summary = store.getUserSummary(me.id);
  assert.equal(summary.owes, 15000);
  assert.equal(summary.owed, 8000);
  assert.equal(summary.net, -7000);
});

test('la importación descarta registros inválidos y conserva una estructura segura', () => {
  const store = new Store();
  const valid = { id: 'a', name: 'Ana', phone: '573001234567' };
  const data = { people: [valid], debts: [{ id: 'bad', from: 'a', to: 'missing', amount: 10 }], settings: {} };
  assert.equal(store.importData(JSON.stringify(data)), true);
  assert.equal(store.data.people.length, 1);
  assert.equal(store.data.debts.length, 0);
  assert.equal(store.data.settings.activeUserId, 'a');
});
