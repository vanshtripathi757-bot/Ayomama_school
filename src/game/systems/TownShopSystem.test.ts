import test from 'node:test';
import assert from 'node:assert/strict';
import { getOwnedTownItemIds, getTownShopItems, purchaseTownItem } from './TownShopSystem';
import { INITIAL_MISSION_PROGRESS } from '../../config/defaults';

test('town shops expose unique items and separate shop inventories', () => {
  const ids = getTownShopItems('manga-shop').map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(getTownShopItems('konbini').length, 3);
});

test('purchase deducts CP once and preserves existing inventory', () => {
  const start = { ...INITIAL_MISSION_PROGRESS, cpPoints: 30, inventoryItems: ['Hoshino Student ID Card'] };
  const result = purchaseTownItem(start, 'manga-volume-01');
  assert.equal(result.success, true);
  assert.equal(result.progress.cpPoints, 15);
  assert.deepEqual(result.progress.inventoryItems, ['Hoshino Student ID Card', 'town-item:manga-volume-01']);
  const duplicate = purchaseTownItem(result.progress, 'manga-volume-01');
  assert.equal(duplicate.reason, 'already-owned');
  assert.equal(duplicate.progress.cpPoints, 15);
});

test('purchase rejects unknown items and insufficient CP without mutation', () => {
  const start = { ...INITIAL_MISSION_PROGRESS, cpPoints: 2, inventoryItems: [] };
  assert.equal(purchaseTownItem(start, 'missing').reason, 'unknown-item');
  assert.equal(purchaseTownItem(start, 'sports-drink').reason, 'insufficient-cp');
  assert.deepEqual(getOwnedTownItemIds(['town-item:onigiri', 'library-book:book-a']), ['onigiri']);
});
