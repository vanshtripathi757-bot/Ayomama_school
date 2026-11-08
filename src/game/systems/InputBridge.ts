/**
 * Zero-GC Input Bridge connecting Desktop Keyboard and Mobile Touch Controls
 * directly to the 60Hz Three.js simulation loop without React re-renders.
 */
export interface SharedInputState {
  // Mobile Virtual Thumbstick normalized vector (-1 to +1)
  joystickX: number;
  joystickY: number;
  joystickActive: boolean;

  // Mobile Action Pad states
  mobileSprintHeld: boolean;
  mobileSprintToggle: boolean;
  mobileJumpHeld: boolean;
  mobileJumpJustPressed: boolean;
  mobileInteractJustPressed: boolean;

  // Live Player Telemetry (read by HUD at throttled intervals)
  playerX: number;
  playerY: number;
  playerZ: number;
  playerYaw: number;

  // Phase 4 Quick Zone Teleport request consumed by the 60Hz simulation loop
  teleportRequest: { x: number; y: number; z: number; yaw: number } | null;
}

export const sharedInputBridge: SharedInputState = {
  joystickX: 0,
  joystickY: 0,
  joystickActive: false,
  mobileSprintHeld: false,
  mobileSprintToggle: false,
  mobileJumpHeld: false,
  mobileJumpJustPressed: false,
  mobileInteractJustPressed: false,
  playerX: 0,
  playerY: 0,
  playerZ: 22,
  playerYaw: Math.PI,
  teleportRequest: null,
};

export function setMobileJoystick(x: number, y: number, active: boolean): void {
  sharedInputBridge.joystickX = Math.max(-1, Math.min(1, x));
  sharedInputBridge.joystickY = Math.max(-1, Math.min(1, y));
  sharedInputBridge.joystickActive = active;
}

export function triggerMobileJump(pressed: boolean): void {
  if (pressed && !sharedInputBridge.mobileJumpHeld) {
    sharedInputBridge.mobileJumpJustPressed = true;
  }
  sharedInputBridge.mobileJumpHeld = pressed;
}

export function triggerMobileSprintToggle(): boolean {
  sharedInputBridge.mobileSprintToggle = !sharedInputBridge.mobileSprintToggle;
  return sharedInputBridge.mobileSprintToggle;
}

export function setMobileSprintHeld(held: boolean): void {
  sharedInputBridge.mobileSprintHeld = held;
}

export function triggerMobileInteract(): void {
  sharedInputBridge.mobileInteractJustPressed = true;
}

export function requestPlayerTeleport(x: number, z: number, yaw = Math.PI, y = 0): void {
  sharedInputBridge.teleportRequest = { x, y, z, yaw };
}

export function resetMobileInputBridge(): void {
  sharedInputBridge.joystickX = 0;
  sharedInputBridge.joystickY = 0;
  sharedInputBridge.joystickActive = false;
  sharedInputBridge.mobileJumpHeld = false;
  sharedInputBridge.mobileJumpJustPressed = false;
  sharedInputBridge.mobileInteractJustPressed = false;
}
