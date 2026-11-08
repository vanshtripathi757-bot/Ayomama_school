import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSIT_DESTINATIONS, getTransitDestination, isValidTransitPosition } from './TransitSystem';

test('transit destinations have unique ids and valid coordinates', () => {
  const ids = TRANSIT_DESTINATIONS.map((destination) => destination.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const destination of TRANSIT_DESTINATIONS) {
    assert.ok(isValidTransitPosition(destination.position));
    assert.ok(destination.label.length > 0);
  }
});

test('transit lookup returns known destinations and rejects unknown ids', () => {
  assert.equal(getTransitDestination('student-dormitory')?.position.x, -45);
  assert.equal(getTransitDestination('not-a-destination'), null);
});

test('transit positions reject invalid coordinates', () => {
  assert.equal(isValidTransitPosition({ x: Number.NaN, y: 0, z: 1 }), false);
  assert.equal(isValidTransitPosition({ x: 0, y: -1, z: 1 }), false);
});
