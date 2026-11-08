import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPUS_WORLD_OBJECTS, createCampusWorldInteractionSystem } from './CampusWorldCatalog';
import { NPC_OBJECT_ACTIVITIES } from './NpcAutonomySystem';

test('campus catalog has unique stable ids and useful actions', () => {
  const ids = CAMPUS_WORLD_OBJECTS.map((object) => object.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.type === 'bookshelf' && object.actions.some((action) => action.id === 'browse-books')));
  assert.equal(CAMPUS_WORLD_OBJECTS.filter((object) => object.type === 'seat' && object.roomId === 'class-a').length, 9);
});

test('all four academy classes have registered walk-in seating and teacher desks', () => {
  const expected = [
    { roomId: 'class-a', seats: 9 },
    { roomId: 'class-b', seats: 6 },
    { roomId: 'class-c', seats: 6 },
    { roomId: 'class-d', seats: 6 },
  ];
  for (const room of expected) {
    assert.equal(
      CAMPUS_WORLD_OBJECTS.filter((object) => object.type === 'seat' && object.roomId === room.roomId).length,
      room.seats,
      `${room.roomId} seat registry`,
    );
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `${room.roomId}-teacher-desk`));
  }
});

test('each upper dormitory floor exposes rest and study interactions', () => {
  for (const floor of [1, 2, 3]) {
    assert.equal(
      CAMPUS_WORLD_OBJECTS.filter((object) => object.id.startsWith(`dormitory-floor-${floor}-bed-`)).length,
      2,
    );
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `dormitory-floor-${floor}-study-desk`));
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `dormitory-elevator-floor-${floor}`));
  }
});

test('all four residential homes expose usable furniture interactions', () => {
  for (const homeId of ['west-south', 'east-south', 'west-north', 'east-north']) {
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `residential-${homeId}-sofa`));
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `residential-${homeId}-bed`));
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `residential-${homeId}-desk`));
    assert.ok(CAMPUS_WORLD_OBJECTS.some((object) => object.id === `residential-${homeId}-mailbox`));
  }
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
  assert.equal(CAMPUS_WORLD_OBJECTS.filter((object) => object.id.startsWith('dormitory-elevator-')).length, 4);
  assert.ok(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'dormitory-bed-west')?.actions.some((action) => action.id === 'rest'));
  assert.ok(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'medical-room-reception')?.actions.some((action) => action.id === 'use'));
  assert.equal(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'station-ticket-terminal')?.type, 'terminal');
  assert.ok(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'town-manga-shop-counter')?.actions.some((action) => action.id === 'view-menu'));
  assert.ok(CAMPUS_WORLD_OBJECTS.find((object) => object.id === 'town-konbini-counter')?.actions.some((action) => action.id === 'view-menu'));
});

test('regional facilities expose meaningful player interactions', () => {
  const byId = new Map(CAMPUS_WORLD_OBJECTS.map((object) => [object.id, object]));
  assert.ok(byId.get('east-aquatics-deck')?.actions.some((action) => action.id === 'start-activity'));
  assert.ok(byId.get('research-centre-observatory')?.actions.some((action) => action.id === 'inspect'));
  assert.ok(byId.get('west-koi-garden-bridge')?.actions.some((action) => action.id === 'inspect'));
  assert.ok(byId.get('festival-amphitheatre-stage')?.actions.some((action) => action.id === 'start-activity'));
  assert.ok(byId.get('mountain-shrine-altar')?.actions.some((action) => action.id === 'inspect'));
  assert.ok(byId.get('station-timetable-board')?.actions.some((action) => action.id === 'view-map'));
});

test('every scheduled NPC object activity points to a registered world object', () => {
  const registeredIds = new Set(CAMPUS_WORLD_OBJECTS.map((object) => object.id));
  for (const activity of NPC_OBJECT_ACTIVITIES) {
    assert.ok(registeredIds.has(activity.objectId), `${activity.npcId} references missing object ${activity.objectId}`);
  }
});
