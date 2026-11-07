import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPUS_WORLD_OBJECTS, createCampusWorldInteractionSystem } from './CampusWorldCatalog';

test('campus catalog has unique stable ids and useful actions', () => {
  const ids = CAMPUS_WORLD_OBJECTS.map((object) => object.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.type === 'bookshelf' && object.actions.some((action) => action.id === 'browse-books')));
  assert.equal(CAMPUS_WORLD_OBJECTS.filter((object) => object.type === 'seat' && object.roomId === 'class-a').length, 9);
});

test('campus catalog creates a registry with access-controlled archive objects', () => {
  const system = createCampusWorldInteractionSystem();
  assert.equal(system.getAll().length, CAMPUS_WORLD_OBJECTS.length);
  assert.equal(system.get('east-library-archive-cabinet')?.displayName, 'Locked Archive Cabinet');
  assert.deepEqual(system.getAvailableActions('east-library-archive-cabinet'), []);
  assert.deepEqual(
    system.getAvailableActions('east-library-archive-cabinet', new Set(['archive-access'])).map((action) => action.id),
    ['inspect'],
  );
});

test('expanded facility and transport objects expose the expected actions', () => {
  assert.equal(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'dormitory-main-entry')?.actions[0]?.id, 'enter');
  assert.ok(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'dormitory-bed-west')?.actions.some((action) => action.id === 'rest'));
  assert.ok(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'medical-room-reception')?.actions.some((action) => action.id === 'use'));
  assert.equal(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'station-ticket-terminal')?.type, 'terminal');
});
