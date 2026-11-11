import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { register } from 'tsx/esm/api';
import { JSDOM } from 'jsdom';
import { createElement as h, act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

register({ tsconfig: './tsconfig.app.json' });
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
});
globalThis.fetch = async () => ({ ok: false });
const { MemoryRouter } = await import('react-router-dom');
const { default: Navbar } = await import('../src/components/NavBar.tsx');
const { default: Sprite } = await import('../src/components/PokemonSprite.tsx');
const { default: Tracker } = await import('../src/pages/Tracker.tsx');
const { default: Box } = await import('../src/pages/Box.tsx');
const { default: Graveyard } = await import('../src/pages/Graveyard.tsx');
const storage = await import('../src/run/storage.ts');
const { useActiveRun } = await import('../src/run/useActiveRun.ts');
const container = document.getElementById('root');
let root;
async function render(element) {
  root ??= createRoot(container);
  await act(async () => root.render(h(StrictMode, null, h(MemoryRouter, null, element))));
}
async function click(element) {
  assert.ok(element);
  await act(async () => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
}
function run(name) {
  return storage.createRun({ name, gameId: 'emerald' });
}
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = undefined;
  localStorage.clear();
  globalThis.fetch = async () => ({ ok: false });
});

test('menu refreshes on every open after creating and renaming saved runs', async () => {
  const first = run('First run');
  storage.saveRun(first);
  await render(h(Navbar));
  const toggle = () => container.querySelector('[aria-label="Load Run"]');
  await click(toggle());
  assert.match(container.textContent, /First run/);
  await click(toggle());
  storage.saveRun({ ...first, name: 'Renamed run' });
  storage.saveRun(run('New run'));
  await click(toggle());
  assert.match(container.textContent, /Renamed run/);
  assert.match(container.textContent, /New run/);
  assert.doesNotMatch(container.textContent, /First run/);
});

test('species changes reset loading and failures and ignore outdated pending results', async () => {
  const pending = new Map();
  globalThis.fetch = (url) => new Promise(resolve => pending.set(url.split('/').at(-1), resolve));
  const finish = async (species, url) => act(async () => pending.get(species)({
    ok: true, json: async () => ({ sprites: { front_default: url } }),
  }));
  await render(h(Sprite, { species: 'Old' }));
  await render(h(Sprite, { species: 'New' }));
  assert.ok(container.querySelector('.animate-pulse'));
  await finish('new', '/new.png');
  await finish('old', '/old.png');
  assert.equal(container.querySelector('img').getAttribute('src'), '/new.png');
  await render(h(Sprite, { species: 'Missing' }));
  assert.equal(container.querySelector('img'), null);
  assert.ok(container.querySelector('.animate-pulse'));
  await finish('missing', null);
  assert.equal(container.textContent, '?');
  await render(h(Sprite, { species: 'Recovered' }));
  assert.ok(container.querySelector('.animate-pulse'));
  await finish('recovered', '/recovered.png');
  await act(async () => container.querySelector('img').dispatchEvent(new dom.window.Event('error')));
  assert.equal(container.textContent, '?');
  await render(h(Sprite, { species: 'New' }));
  assert.equal(container.querySelector('img').getAttribute('src'), '/new.png');
});

for (const Page of [Tracker, Box, Graveyard]) {
  test(`${Page.name} follows switching and clearing without writing on render`, async () => {
    const first = run('First adventure');
    const second = run('Second adventure');
    storage.saveRun(first);
    storage.saveRun(second);
    storage.setActiveRun(first.id);
    await render(h(Page));
    assert.match(container.textContent, /First adventure/);
    await act(async () => storage.setActiveRun(second.id));
    assert.match(container.textContent, /Second adventure/);
    assert.doesNotMatch(container.textContent, /First adventure/);
    assert.equal(storage.loadActiveRun().id, second.id);
    await act(async () => { storage.deleteRun(first.id); storage.deleteRun(second.id); });
    assert.match(container.textContent, /No active run found/);
    assert.equal(storage.loadActiveRun(), null);
  });
}

test('edits persist across remounts and stale handlers cannot edit or reactivate a previous run', async () => {
  const first = run('First');
  const second = run('Second');
  storage.saveRun(first);
  storage.saveRun(second);
  storage.setActiveRun(first.id);
  let edit;
  function Editor() {
    const [current, update] = useActiveRun();
    edit = update;
    return h('p', null, current?.name);
  }
  await render(h(Editor));
  const staleEdit = edit;
  await act(async () => edit(current => ({ ...current, name: 'Edited', encounters: [
    { id: 'catch', routeId: 'route-101', pokemon: 'Poochyena', nickname: 'Pup', status: 'Boxed' },
  ] })));
  await act(async () => storage.setActiveRun(second.id));
  await act(async () => staleEdit(current => ({ ...current, name: 'Stale' })));
  assert.equal(storage.loadActiveRun().id, second.id);
  assert.equal(storage.listRuns().find(r => r.id === first.id).name, 'Edited');
  await act(async () => root.unmount());
  root = undefined;
  storage.setActiveRun(first.id);
  await render(h(Editor));
  assert.equal(container.textContent, 'Edited');
  assert.equal(storage.loadActiveRun().encounters[0].nickname, 'Pup');
  await act(async () => edit(current => ({ ...current, encounters: current.encounters.map(e => ({ ...e, status: 'Dead' })) })));
  assert.equal(storage.loadActiveRun().encounters[0].status, 'Dead');
});

for (const status of ['Team', 'Boxed', 'Dead']) {
  test(`confirmed ${status} deletion persists by ID and updates route, Box, and Graveyard`, async () => {
    const first = { ...run('First'), encounters: [
      { id: 'target', routeId: 'route-101', pokemon: 'Poochyena', nickname: 'Twin', status },
      { id: 'keep', routeId: 'route-101', pokemon: 'Poochyena', nickname: 'Twin', status },
    ] };
    const second = { ...run('Second'), encounters: [...first.encounters] };
    storage.saveRun(second);
    storage.saveRun(first);
    await render(h('div', null, h(Tracker), h(Box), h(Graveyard)));
    const route = () => [...container.querySelectorAll('section')].find(section => section.querySelector('h3')?.textContent === 'Route 101');
    const button = (label) => [...route().querySelectorAll('button')].find(item => item.textContent === label);
    const before = localStorage.getItem('nuzzy_run_library');
    const speciesPicker = () => route().querySelector('[aria-label="Pokémon for Route 101"]');
    assert.equal(speciesPicker(), null);
    assert.equal(route().querySelector('input'), null);
    await click(button('Delete'));
    const group = container.querySelector('[aria-label="Confirm encounter deletion"]');
    assert.match(group.textContent, /Delete Twin \(Poochyena\) from Route 101\? This cannot be undone/);
    assert.equal(document.activeElement.textContent, 'Cancel');
    assert.equal(localStorage.getItem('nuzzy_run_library'), before);
    await click(button('Cancel'));
    assert.equal(document.activeElement, button('Delete'));
    assert.equal(localStorage.getItem('nuzzy_run_library'), before);
    await click(button('Delete'));
    await act(async () => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(container.querySelector('[aria-label="Confirm encounter deletion"]'), null);
    assert.equal(document.activeElement, button('Delete'));
    await click(button('Delete'));
    await click(button('Confirm delete'));
    assert.deepEqual(storage.loadActiveRun().encounters, [first.encounters[1]]);
    assert.deepEqual(storage.listRuns().find(item => item.id === second.id), second);
    assert.match(route().textContent, /1 encounter\b/);
    assert.equal(speciesPicker(), null);
    assert.equal(route().querySelector('input'), null);
    assert.equal(document.activeElement, route().querySelector('h3'));
    // One remaining Twin in Tracker and one in its corresponding destination view.
    assert.equal([...container.querySelectorAll('span')].filter(item => item.textContent === 'Twin').length, 2);
    if (status === 'Team') assert.match(container.textContent, /1 \/ 6/);
    if (status === 'Dead') assert.match(container.textContent, /1 fallen/);
    await act(async () => root.unmount());
    root = undefined;
    await render(h(Tracker));
    assert.equal(speciesPicker(), null);
    assert.equal(route().querySelector('input'), null);
    assert.equal(route().querySelectorAll('[aria-label="Delete Twin (Poochyena)"]').length, 1);
    await click(button('Delete'));
    await click(button('Confirm delete'));
    assert.deepEqual(storage.loadActiveRun().encounters, []);
    assert.match(route().textContent, /0 encounters/);
    assert.equal(speciesPicker().disabled, false);
    assert.ok(route().querySelector('input'));
    assert.ok(button('Log'));
    assert.match(container.textContent, /No encounters logged yet/);
  });
}

test('switching runs clears a pending encounter deletion', async () => {
  const first = { ...run('First'), encounters: [
    { id: 'shared', routeId: 'route-101', pokemon: 'Poochyena', nickname: 'First pup', status: 'Team' },
  ] };
  const second = { ...run('Second'), encounters: [{ ...first.encounters[0], nickname: 'Second pup' }] };
  storage.saveRun(second);
  storage.saveRun(first);
  await render(h(Tracker));
  await click(container.querySelector('[aria-label="Delete First pup (Poochyena)"]'));
  await act(async () => storage.setActiveRun(second.id));
  assert.equal(container.querySelector('[aria-label="Confirm encounter deletion"]'), null);
  assert.deepEqual(storage.listRuns().find(item => item.id === first.id), first);
  assert.deepEqual(storage.loadActiveRun(), second);
});
