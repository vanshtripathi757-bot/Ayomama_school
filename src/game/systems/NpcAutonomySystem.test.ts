import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NPC_ACTIVITY_ANCHORS,
  NPC_DAILY_SCHEDULES,
  appendNpcMemory,
  appendNpcRelationshipMemory,
  getNpcActivityDirectives,
  getNpcDailyDirective,
  getNpcMemoryContext,
} from './NpcAutonomySystem';

test('every scheduled NPC has a valid anchor for all three daily periods', () => {
  const anchorIds = new Set(NPC_ACTIVITY_ANCHORS.map((anchor) => anchor.id));
  for (const [npcId, schedule] of Object.entries(NPC_DAILY_SCHEDULES)) {
    for (const period of ['morning', 'golden_hour', 'twilight'] as const) {
      const row = schedule[period];
      assert.ok(row, `${npcId} is missing ${period}`);
      assert.ok(anchorIds.has(row.anchor), `${npcId} uses an unknown anchor`);
      const directive = getNpcDailyDirective(npcId, period);
      assert.ok(directive);
      assert.equal(directive.npcId, npcId);
      assert.equal(directive.period, period);
    }
  }
});

test('schedule directives are deterministic and only include configured NPCs', () => {
  const first = getNpcActivityDirectives('golden_hour');
  const second = getNpcActivityDirectives('golden_hour');
  assert.deepEqual(first, second);
  assert.ok(Object.keys(first).length >= 8);
  assert.equal(getNpcDailyDirective('unknown-npc', 'morning'), null);
});

test('NPC memories are deduplicated, bounded per NPC and preserve other NPCs', () => {
  let memories = appendNpcMemory([], {
    id: 'm1', npcId: 'npc_hana', kind: 'greeting', summary: ' Met the new student ', occurredAt: 1,
  }, 2);
  memories = appendNpcMemory(memories, {
    id: 'm1', npcId: 'npc_hana', kind: 'greeting', summary: 'Duplicate', occurredAt: 2,
  }, 2);
  memories = appendNpcMemory(memories, {
    id: 'm2', npcId: 'npc_hana', kind: 'help', summary: 'Helped with orientation', occurredAt: 3,
  }, 2);
  memories = appendNpcMemory(memories, {
    id: 'm3', npcId: 'npc_hana', kind: 'story-clue', summary: 'Found a clue', occurredAt: 4,
  }, 2);
  memories = appendNpcMemory(memories, {
    id: 'm4', npcId: 'npc_ren', kind: 'shared-activity', summary: 'Played in the courtyard', occurredAt: 5,
  }, 2);
  assert.deepEqual(memories.map((memory) => memory.id), ['m2', 'm3', 'm4']);
  assert.deepEqual(getNpcMemoryContext(memories, 'npc_hana'), ['Helped with orientation', 'Found a clue']);
});

test('invalid NPC memory events are ignored and summaries are capped', () => {
  const initial = [];
  assert.equal(appendNpcMemory(initial, {
    id: '', npcId: 'npc_hana', kind: 'greeting', summary: 'Hi', occurredAt: 1,
  }), initial);
  const result = appendNpcMemory(initial, {
    id: 'long', npcId: 'npc_hana', kind: 'greeting', summary: 'x'.repeat(300), occurredAt: 1,
  });
  assert.equal(result[0].summary.length, 180);
});

test('relationship memories are persisted with bounded length and familiarity', () => {
  let relationships = appendNpcRelationshipMemory(undefined, 'npc_hana', 'Met the transfer student');
  relationships = appendNpcRelationshipMemory(relationships, 'npc_hana', 'Discussed the library archive');
  relationships = appendNpcRelationshipMemory(relationships, 'npc_hana', 'Discussed the library archive');
  assert.equal(relationships.npc_hana.familiarity, 2);
  assert.deepEqual(relationships.npc_hana.memories, [
    'Met the transfer student',
    'Discussed the library archive',
  ]);
});
