import assert from 'node:assert/strict';
import test from 'node:test';

const KEY = 'nuzzy:poke-sprites:v2';
const LEGACY_KEY = 'nuzzy:poke-sprites:v1';
let instance = 0;
async function setup(values = []) {
  const stored = new Map(values);
  globalThis.localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
  };
  const api = await import(`../src/lib/pokemonSprites.ts?test=${instance++}`);
  return { ...api, stored };
}
const response = (url) => ({ ok: true, json: async () => ({ sprites: { front_default: url } }) });

test('pack punctuation names resolve explicitly; generic names keep working', async () => {
  const { speciesToSlug, getSpriteUrl } = await setup();
  const cases = [
    ["Farfetch'd", 'farfetchd'], ['Farfetch’d', 'farfetchd'],
    ['Mr. Mime', 'mr-mime'], ['Mime Jr.', 'mime-jr'],
    ['Nidoran♀', 'nidoran-f'], ['Nidoran♂', 'nidoran-m'],
    ['Ho-Oh', 'ho-oh'], ['  PIKACHU  ', 'pikachu'],
  ];
  for (const [name, slug] of cases) {
    assert.equal(speciesToSlug(name), slug);
    globalThis.fetch = async (url) => {
      assert.equal(url, `https://pokeapi.co/api/v2/pokemon/${slug}`);
      return response(`/${slug}.png`);
    };
    assert.equal(await getSpriteUrl(name), `/${slug}.png`);
  }
});

test('legacy successful URLs survive; legacy nulls and invalid entries retry', async () => {
  const legacy = JSON.stringify({ cached: '/cached.png', outage: null, invalid: {}, empty: '' });
  const { getSpriteUrl, stored } = await setup([[LEGACY_KEY, legacy]]);
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response('/recovered.png'); };
  assert.equal(await getSpriteUrl('cached'), '/cached.png');
  assert.equal(calls, 0);
  for (const name of ['outage', 'invalid', 'empty']) {
    assert.equal(await getSpriteUrl(name), '/recovered.png');
  }
  assert.equal(calls, 3);
  assert.equal(stored.get(LEGACY_KEY), legacy);
  assert.equal(JSON.parse(stored.get(KEY)).outage, '/recovered.png');
});

test('network, HTTP, JSON and malformed response failures can recover', async () => {
  const failures = [
    async () => { throw new Error('offline'); },
    async () => ({ ok: false, status: 503 }),
    async () => ({ ok: false, status: 429 }),
    async () => ({ ok: true, json: async () => { throw new Error('bad json'); } }),
    async () => ({ ok: true, json: async () => ({}) }),
    async () => response(123),
    async () => response(''),
  ];
  const { getSpriteUrl, stored } = await setup();
  for (const [index, failure] of failures.entries()) {
    const species = `failure-${index}`;
    globalThis.fetch = failure;
    assert.equal(await getSpriteUrl(species), null);
    assert.equal(stored.has(KEY), index > 0);
    assert.equal(JSON.parse(stored.get(KEY) ?? '{}')[species], undefined);
    globalThis.fetch = async () => response('/success.png');
    assert.equal(await getSpriteUrl(species), '/success.png');
    assert.equal(JSON.parse(stored.get(KEY))[species], '/success.png');
  }
});

test('confirmed 404 and explicit missing sprites persist and avoid repeat requests', async () => {
  const { getSpriteUrl, stored } = await setup();
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { ok: false, status: 404 }; };
  assert.equal(await getSpriteUrl('unknown'), null);
  globalThis.fetch = async () => { calls++; return response(null); };
  assert.equal(await getSpriteUrl('no-sprite'), null);
  assert.deepEqual(JSON.parse(stored.get(KEY)), { unknown: null, 'no-sprite': null });
  await getSpriteUrl('unknown');
  await getSpriteUrl('no-sprite');
  assert.equal(calls, 2);
  const next = await setup([...stored]);
  await next.getSpriteUrl('unknown');
  await next.getSpriteUrl('no-sprite');
  assert.equal(calls, 2);
});

test('concurrent success and failure requests deduplicate; only successes remain cached', async () => {
  const { getSpriteUrl } = await setup();
  let calls = 0;
  let finish;
  globalThis.fetch = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const first = getSpriteUrl('Pikachu');
  const second = getSpriteUrl('pikachu');
  assert.equal(calls, 1);
  finish(response('/pikachu.png'));
  assert.equal(await first, '/pikachu.png');
  assert.equal(await second, '/pikachu.png');
  await getSpriteUrl('Pikachu');
  assert.equal(calls, 1);
  const failure1 = getSpriteUrl('retry');
  const failure2 = getSpriteUrl('retry');
  assert.equal(calls, 2);
  finish({ ok: false, status: 500 });
  assert.equal(await failure1, null);
  assert.equal(await failure2, null);
  const retry = getSpriteUrl('retry');
  assert.equal(calls, 3);
  finish(response('/retry.png'));
  assert.equal(await retry, '/retry.png');
});

test('corrupt or unavailable cache storage does not prevent sprite fetching', async () => {
  for (const raw of ['null', '[]', '42', '{', '{"bad":false}']) {
    const { getSpriteUrl } = await setup([[KEY, raw], [LEGACY_KEY, raw]]);
    globalThis.fetch = async () => response('/ok.png');
    assert.equal(await getSpriteUrl('valid'), '/ok.png');
  }
  const { getSpriteUrl } = await setup();
  globalThis.localStorage = {
    getItem: () => { throw new Error('unavailable'); },
    setItem: () => { throw new Error('quota'); },
  };
  globalThis.fetch = async () => response('/memory.png');
  assert.equal(await getSpriteUrl('memory'), '/memory.png');
  globalThis.fetch = () => { throw new Error('should use memory'); };
  assert.equal(await getSpriteUrl('memory'), '/memory.png');
});
