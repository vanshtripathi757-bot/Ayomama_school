import test from 'node:test';
import assert from 'node:assert/strict';
import { Group } from 'three';
import { shouldRegionBeLoaded, STREAM_REGION_BUDGETS, updateWorldStreaming } from './WorldStreamingSystem';

test('region streaming loads and unloads with hysteresis', () => {
  const budget = STREAM_REGION_BUDGETS.dormitory;
  assert.equal(shouldRegionBeLoaded(50, false, budget), true);
  assert.equal(shouldRegionBeLoaded(65, true, budget), true);
  assert.equal(shouldRegionBeLoaded(75, true, budget), false);
  assert.equal(shouldRegionBeLoaded(65, false, budget), false);
});

test('invalid distances preserve current visibility state', () => {
  const budget = STREAM_REGION_BUDGETS['medical-room'];
  assert.equal(shouldRegionBeLoaded(Number.NaN, true, budget), true);
  assert.equal(shouldRegionBeLoaded(-1, false, budget), false);
});

test('world streaming toggles inferred station assets and tagged regions', () => {
  const world = new Group();
  const station = new Group();
  station.position.set(0, 0, 100);
  world.add(station);
  const medical = new Group();
  medical.userData.streamRegionId = 'medical-room';
  medical.userData.streamCenter = { x: 34, z: -27 };
  world.add(medical);

  updateWorldStreaming([world], 0, 0);
  assert.equal(station.visible, false);
  assert.equal(medical.visible, false);

  updateWorldStreaming([world], 0, 100);
  assert.equal(station.visible, true);
  updateWorldStreaming([world], 34, -27);
  assert.equal(medical.visible, true);
});
