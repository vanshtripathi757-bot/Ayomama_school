import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldInteractionSystem, WorldInteractableDefinition } from './WorldInteractionSystem';

const chair: WorldInteractableDefinition = {
  id: 'class-a-seat-01',
  type: 'seat',
  displayName: 'Class A Student Chair',
  position: { x: 0, y: 0, z: 1.5 },
  interactionRange: 2.4,
  actions: [{ id: 'sit', label: 'Sit' }, { id: 'study', label: 'Study' }],
  anchor: { position: { x: 0, y: 0, z: 1.1 }, yaw: 0 },
  roomId: 'class-a',
  floorId: 'academic-ground',
};

test('world interaction registry rejects duplicate ids and invalid ranges', () => {
  const system = new WorldInteractionSystem();
  system.register(chair);
  assert.throws(() => system.register(chair), /Duplicate/);
  assert.throws(() => system.register({ ...chair, id: 'bad-chair', interactionRange: 0 }), /range/);
});

test('target selection respects range, facing and line-of-sight checks', () => {
  const system = new WorldInteractionSystem();
  system.register(chair);
  const target = system.findTarget({
    player: { position: { x: 0, y: 0, z: 0 }, yaw: 0 },
    isOccluded: (_from, _to, id) => id === 'blocked-chair',
  });
  assert.equal(target?.object.id, chair.id);
  assert.equal(system.findTarget({ player: { position: { x: 0, y: 0, z: 8 }, yaw: 0 } }), null);
  assert.equal(system.findTarget({
    player: { position: { x: 0, y: 0, z: 0 }, yaw: 0 },
    isOccluded: () => true,
  }), null);
});

test('actions obey access flags and interaction cooldowns', () => {
  const system = new WorldInteractionSystem();
  system.register({
    ...chair,
    actions: [
      { id: 'sit', label: 'Sit', cooldownMs: 500 },
      { id: 'study', label: 'Study', requiredFlag: 'study-permit' },
    ],
  });
  assert.deepEqual(system.getAvailableActions(chair.id, new Set(), 1000).map((a) => a.id), ['sit']);
  assert.deepEqual(system.getAvailableActions(chair.id, new Set(['study-permit']), 1000).map((a) => a.id), ['sit', 'study']);
  assert.equal(system.begin(chair.id, 'sit', new Set(), 1000), true);
  assert.equal(system.complete(1000), true);
  assert.equal(system.exit(), true);
  assert.deepEqual(system.getAvailableActions(chair.id, new Set(), 1200), []);
  assert.deepEqual(system.getAvailableActions(chair.id, new Set(), 1500).map((a) => a.id), ['sit']);
});

test('only one active interaction is allowed and unregister clears stale state', () => {
  const system = new WorldInteractionSystem();
  system.register(chair);
  assert.equal(system.begin(chair.id, 'sit'), true);
  assert.equal(system.begin(chair.id, 'study'), false);
  assert.equal(system.getState().status, 'active');
  system.unregister(chair.id);
  assert.equal(system.getState().status, 'idle');
  assert.equal(system.getSelected(), null);
});
