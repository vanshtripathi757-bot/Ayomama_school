import {
  IDialogueSystemFoundation,
  IInteractionSystemFoundation,
  IInventorySystemFoundation,
  IMissionSystemFoundation,
  INPCSystemFoundation,
  IPhysicsFoundation,
  IPlayerControllerFoundation,
  ISchoolTimetableFoundation,
  TimeOfDayPreset,
} from '../../types/game';

/**
 * Phase 1 Architecture Integration Registry
 * Provides clean, modular integration hooks for Phase 2+ gameplay systems
 * without bloating Phase 1 or faking unbuilt gameplay.
 */
export class PlayerControllerFoundation implements IPlayerControllerFoundation {
  public readonly isEnabled = false; // Reserved for Phase 2 Third-Person Controller
  public readonly spawnPosition = { x: 0, y: 0, z: 22 };
  public readonly facingAngleRad = Math.PI; // Facing North toward the Academy Main Wing

  public initialize(): void {
    // Phase 2 integration hook for character capsule & locomotion state machine
  }

  public dispose(): void {
    // Phase 2 cleanup hook
  }
}

export class PhysicsFoundation implements IPhysicsFoundation {
  public readonly engineName = 'rapier-foundation' as const;
  public readonly gravity = { x: 0, y: -9.81, z: 0 };
  public isInitialized = false;

  public initialize(): void {
    this.isInitialized = true;
  }

  public stepSimulation(_dt: number): void {
    // Reserved for Phase 2 Rapier rigid-body & character collider stepping
  }
}

export class NPCSystemFoundation implements INPCSystemFoundation {
  public readonly registeredCount = 0;

  public getScheduleSlot(timeOfDay: TimeOfDayPreset): string {
    switch (timeOfDay) {
      case 'morning':
        return 'Homeroom Assembly & Courtyard Arrival';
      case 'golden_hour':
        return 'Club Activities & Courtyard Social Hour';
      case 'twilight':
        return 'Evening Self-Study & Campus Gate Closure';
    }
  }
}

export class DialogueSystemFoundation implements IDialogueSystemFoundation {
  public readonly isDialogueActive = false;
  public readonly activeSpeakerId = null;
}

export class InteractionSystemFoundation implements IInteractionSystemFoundation {
  public readonly interactionRadiusMeters = 2.2;
  public readonly focusedTargetId = null;
}

export class MissionSystemFoundation implements IMissionSystemFoundation {
  public readonly currentPhaseLabel = 'Phase 1 Foundation: Campus Inspection';
  public readonly activeObjectives = [
    'Inspect the 3D Seiran High Academy courtyard and clock tower architecture',
    'Test camera viewpoint transitions and atmospheric time-of-day lighting',
    'Verify graphics quality presets and local save persistence',
  ];
}

export class SchoolTimetableFoundation implements ISchoolTimetableFoundation {
  public readonly currentPeriodName = 'Campus Orientation';
  public readonly bellSchedule = [
    { time: '08:15', period: 'Morning Homeroom' },
    { time: '08:30', period: 'Period 1 — Literature & Classical Studies' },
    { time: '12:15', period: 'Courtyard Lunch Recess' },
    { time: '15:30', period: 'After-School Club Activities' },
    { time: '18:00', period: 'Campus Gate Lock' },
  ];
}

export class InventorySystemFoundation implements IInventorySystemFoundation {
  public readonly capacity = 24;
  public readonly items = [
    { id: 'student_id_card', name: 'Seiran High Student ID', category: 'Key Item' },
    { id: 'campus_handbook', name: 'Academy Orientation Map', category: 'Document' },
  ];
}

export const architectureRegistry = {
  player: new PlayerControllerFoundation(),
  physics: new PhysicsFoundation(),
  npc: new NPCSystemFoundation(),
  dialogue: new DialogueSystemFoundation(),
  interaction: new InteractionSystemFoundation(),
  mission: new MissionSystemFoundation(),
  timetable: new SchoolTimetableFoundation(),
  inventory: new InventorySystemFoundation(),
};
