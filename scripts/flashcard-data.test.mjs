import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const dataFile = 'data/isc2-cc-master-flashcards-2026-clean.json';
const studyDataFile = 'data/isc2-cc-study-vocabulary.json';
const cards = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const studyCards = JSON.parse(fs.readFileSync(studyDataFile, 'utf8'));

test('starter dataset passes the validator', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-flashcards.mjs', dataFile], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('starter dataset has unique IDs and vocabulary', () => {
  assert.ok(Array.isArray(cards));
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
  assert.equal(new Set(cards.map((card) => card.vocab.trim().toLowerCase())).size, cards.length);
});

test('starter dataset has valid review dates and positive intervals', () => {
  for (const card of cards) {
    assert.equal(Number.isNaN(Date.parse(card.nextReviewDate)), false, card.id);
    assert.equal(typeof card.interval, 'number', card.id);
    assert.ok(card.interval > 0, card.id);
  }
});

test('ISC2 CC study vocabulary deck passes validation', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-flashcards.mjs', studyDataFile], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(studyCards.length, 55);
  assert.ok(studyCards.every((card) => card.category === 'cert' && card.deck === 'ISC2 CC Study Vocabulary'));
});