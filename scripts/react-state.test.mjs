import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { register } from 'tsx/esm/api';
import { JSDOM } from 'jsdom';
import { createElement as h, act, StrictMode } from 'react';

register({ tsconfig: './tsconfig.app.json' });
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
});
globalThis.fetch = async () => ({ ok: false });
const { createRoot } = await import('react-dom/client');
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

function trackerTotals() {
  const summary = container.querySelector('dl[aria-label="Encounter totals"]');
  assert.ok(summary);
  return Object.fromEntries([...summary.children].map(item => [
    item.querySelector('dt').textContent, Number(item.querySelector('dd').textContent),
  ]));
}

async function changeValue(element, value) {
  assert.ok(element);
  const prototype = element.tagName === 'INPUT'
    ? dom.window.HTMLInputElement.prototype : dom.window.HTMLSelectElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new dom.window.Event(element.tagName === 'INPUT' ? 'input' : 'change', { bubbles: true }));
  });
}

test('tracker totals start at zero and update after logging and status changes', async () => {
  storage.saveRun(run('Fresh adventure'));
  await render(h(Tracker));
  assert.deepEqual(trackerTotals(), { Team: 0, Boxed: 0, Dead: 0, Total: 0 });
  const summary = container.querySelector('dl[aria-label="Encounter totals"]');
  assert.ok(summary.compareDocumentPosition(container.querySelector('h2')) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(summary.getAttribute('aria-live'), 'polite');
  const starter = container.querySelector('section');
  await changeValue(starter.querySelector('input'), 'Leaf');
  await click([...starter.querySelectorAll('button')].find(button => button.textContent === 'Log'));
  assert.deepEqual(trackerTotals(), { Team: 1, Boxed: 0, Dead: 0, Total: 1 });
  const status = () => container.querySelector('[aria-label="Status for Leaf"]');
  await changeValue(status(), 'Boxed');
  assert.deepEqual(trackerTotals(), { Team: 0, Boxed: 1, Dead: 0, Total: 1 });
  await changeValue(status(), 'Dead');
  assert.deepEqual(trackerTotals(), { Team: 0, Boxed: 0, Dead: 1, Total: 1 });
  assert.equal(storage.loadActiveRun().encounters[0].status, 'Dead');
  await act(async () => root.unmount());
  root = undefined;
  await render(h(Tracker));
  assert.deepEqual(trackerTotals(), { Team: 0, Boxed: 0, Dead: 1, Total: 1 });
});

test('tracker totals count all saved encounters and follow the active run', async () => {
  const first = { ...run('Older adventure'), encounters: [
    ...Array.from({ length: 8 }, (_, index) => ({
      id: `team-${index}`, routeId: 'route-101', pokemon: 'Poochyena', nickname: `Pup ${index}`, status: 'Team',
    })),
    { id: 'reserve', routeId: 'route-101', pokemon: 'Zigzagoon', nickname: 'Zig', status: 'Boxed' },
    { id: 'fallen', routeId: 'old-route-id', pokemon: 'Wurmple', nickname: 'Worm', status: 'Dead' },
  ] };
  const second = run('Empty adventure');
  storage.saveRun(second);
  storage.saveRun(first);
  const saved = localStorage.getItem('nuzzy_run_library');
  await render(h(Tracker));
  assert.deepEqual(trackerTotals(), { Team: 8, Boxed: 1, Dead: 1, Total: 10 });
  assert.equal(localStorage.getItem('nuzzy_run_library'), saved);
  await act(async () => storage.setActiveRun(second.id));
  assert.deepEqual(trackerTotals(), { Team: 0, Boxed: 0, Dead: 0, Total: 0 });
  await act(async () => storage.setActiveRun(first.id));
  assert.deepEqual(trackerTotals(), { Team: 8, Boxed: 1, Dead: 1, Total: 10 });
  await act(async () => { storage.deleteRun(first.id); storage.deleteRun(second.id); });
  assert.equal(container.querySelector('dl[aria-label="Encounter totals"]'), null);
});

for (const Page of [Tracker, Box, Graveyard]) {
  for (const activeRunId of [null, 'missing-run']) {
    test(`${Page.name} resumes a chosen save with active ID ${activeRunId}`, async () => {
      const first = run('Older adventure');
      first.createdAt = '2026-01-01T00:00:00.000Z';
      first.gameTitle = 'Pokémon Emerald';
      const second = run('Newer adventure');
      second.createdAt = '2026-02-01T00:00:00.000Z';
      localStorage.setItem('nuzzy_run_library', JSON.stringify({
        schemaVersion: 2, runs: [first, second], activeRunId,
      }));
      const before = localStorage.getItem('nuzzy_run_library');
      await render(h(Page));
      assert.match(container.textContent, /Resume a saved run/);
      assert.equal(container.querySelector('a[href="/new-run"]').textContent, 'Start a new run');
      const buttons = [...container.querySelectorAll('button')];
      assert.equal(buttons.length, 2);
      assert.match(buttons[0].textContent, /Newer adventure/);
      assert.match(buttons[0].textContent, /emerald/);
      assert.match(buttons[1].textContent, /Pokémon Emerald/);
      assert.equal(localStorage.getItem('nuzzy_run_library'), before);
      await click(buttons[1]);
      assert.equal(storage.loadActiveRun().id, first.id);
      assert.match(container.querySelector('h1').textContent, /Older adventure/);
      assert.doesNotMatch(container.textContent, /No active run found/);
      assert.deepEqual(storage.listRuns(), [first, second]);
      await act(async () => root.unmount());
      root = undefined;
      await render(h(Page));
      assert.match(container.querySelector('h1').textContent, /Older adventure/);
    });
  }

  test(`${Page.name} offers new-run creation with an empty library`, async () => {
    await render(h(Page));
    assert.match(container.textContent, /No saved runs yet/);
    assert.doesNotMatch(container.textContent, /Resume a saved run/);
    assert.equal(container.querySelector('button'), null);
    assert.ok(container.querySelector('a[href="/new-run"]'));
    assert.equal(localStorage.getItem('nuzzy_run_library'), null);
  });
}
