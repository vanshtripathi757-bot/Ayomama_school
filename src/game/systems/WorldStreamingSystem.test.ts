import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRegionBeLoaded, STREAM_REGION_BUDGETS } from './WorldStreamingSystem';

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
