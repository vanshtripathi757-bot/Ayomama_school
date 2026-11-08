import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnimeCharacterRig } from './AnimeCharacterBuilder';

test('character rig owns a hidden hand-attached book prop that can be shown for reading', () => {
  const rig = createAnimeCharacterRig({
    hairColor: 0x1e1b4b,
    blazerColor: 0x172554,
    accentColor: 0xe11d48,
    gender: 'male',
  });
  assert.ok(rig.heldBookGroup);
  assert.ok(rig.heldClipboardGroup);
  assert.ok(rig.heldSportsBallGroup);
  assert.equal(rig.heldBookGroup?.visible, false);
  assert.equal(rig.heldClipboardGroup?.visible, false);
  assert.equal(rig.heldSportsBallGroup?.visible, false);
  assert.equal(rig.heldBookGroup?.parent, rig.rightArmPivot);
  if (rig.heldBookGroup) rig.heldBookGroup.visible = true;
  assert.equal(rig.heldBookGroup?.visible, true);
  rig.dispose();
});
