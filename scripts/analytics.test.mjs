import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeEncounters } from '../src/run/analytics.ts';

const encounter = (pokemon, status = 'Team') => ({ id: crypto.randomUUID(), routeId: 'r', pokemon, nickname: 'Friend', status });

test('empty run has no rate or most common species', () => {
  assert.deepEqual(summarizeEncounters([]), {
    total: 0, deaths: 0, deathRate: null, mostCaughtCount: 0, mostCaughtSpecies: [],
  });
});

test('counts all statuses and returns every tied species in stable order without mutation', () => {
  const records = Object.freeze([
    encounter('Zubat', 'Dead'), encounter('Abra'), encounter('Zubat', 'Boxed'), encounter('Abra', 'Dead'),
  ].map(Object.freeze));
  assert.deepEqual(summarizeEncounters(records), {
    total: 4, deaths: 2, deathRate: 0.5, mostCaughtCount: 2, mostCaughtSpecies: ['Abra', 'Zubat'],
  });
  assert.deepEqual(summarizeEncounters([...records].reverse()), summarizeEncounters(records));
});

test('winner, all-alive, all-dead and one-of-each cases', () => {
  assert.equal(summarizeEncounters([encounter('Abra')]).deathRate, 0);
  assert.equal(summarizeEncounters([encounter('Abra', 'Dead')]).deathRate, 1);
  assert.deepEqual(summarizeEncounters([encounter('Abra'), encounter('Zubat')]).mostCaughtSpecies, ['Abra', 'Zubat']);
  const summary = summarizeEncounters([encounter('Abra'), encounter('Abra', 'Dead'), encounter('Zubat')]);
  assert.deepEqual(summary.mostCaughtSpecies, ['Abra']);
  assert.equal(summary.deathRate, 1 / 3);
});
