import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

globalThis.document = { body: { classList: { contains: () => false }, dataset: {} } };
const { pieceSVG } = await import('../dist/pieces.js');

test('all nine piece designs render every chess type as SVG', () => {
  const designs = ['classic', 'poster', 'origami', 'kohaku', 'koi-fins', 'koi-wave', 'wave', 'lantern', 'moon'];
  for (const design of designs) for (const type of ['p', 'r', 'n', 'b', 'q', 'k']) {
    const svg = pieceSVG(type, 'w', design, 'coral');
    assert.match(svg, /^<svg class="piece piece-white/);
    assert.match(svg, /<g fill="#ff8f83"/);
    assert.match(svg, /<\/svg>$/);
  }
  assert.match(pieceSVG('q', 'b', 'kohaku', 'glacier'), /koi-piece/);
  assert.equal(pieceSVG('q', 'w', 'kohaku', 'coral'), pieceSVG('q', 'w', 'koi-wave', 'coral'));
  assert.notEqual(pieceSVG('q', 'w', 'koi-fins'), pieceSVG('q', 'w', 'koi-wave'));
  assert.match(pieceSVG('k', 'w', 'koi-fins'), /koi-piece/);
  assert.match(pieceSVG('k', 'w', 'koi-wave'), /#ef7657/);
});

test('all fourteen avatar assets are present for the shop', async () => {
  for (let index = 1; index <= 14; index++) await access(new URL(`../dist/assets/avatars/avatar-${index}.jpg`, import.meta.url));
});
