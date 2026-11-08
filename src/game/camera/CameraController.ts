import * as THREE from 'three';
import { CAMERA_VIEWPOINTS } from '../../config/defaults';
import {
  CameraMode,
  CameraViewpointId,
  GamePhase,
  PlayerPhysicsState,
} from '../../types/game';
import {
  clampCameraPositionAgainstWalls,
  dampValue,
  isInsideSchoolBuilding,
} from '../core/rules';

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

export class AcademyCameraController {
  private currentPos = new THREE.Vector3(0, 4.2, 28.5);
  private currentLook = new THREE.Vector3(0, 1.5, 20.0);
  private followYaw = 0; // 0 = looking North (-Z) behind the player
  private followPitch = 0.24; // Slight downward angle over player shoulder
  private orbitYawOffset = 0;
  private orbitPitchOffset = 0;
  private isDragging = false;
  private activePointerId: number | null = null;
  private prevPointerX = 0;
  private prevPointerY = 0;

  public getCameraYaw(): number {
    return this.followYaw;
  }

  public setCameraYaw(yaw: number): void {
    this.followYaw = yaw;
  }

  public resetOffsets(): void {
    this.orbitYawOffset = 0;
    this.orbitPitchOffset = 0;
  }

  public onPointerDown(clientX: number, clientY: number, pointerId?: number): void {
    this.isDragging = true;
    this.activePointerId = pointerId ?? null;
    this.prevPointerX = clientX;
    this.prevPointerY = clientY;
  }

  public onPointerMove(
    clientX: number,
    clientY: number,
    sensitivity: number,
    invertY: boolean,
    pointerId?: number
  ): void {
    if (!this.isDragging) return;
    if (
      this.activePointerId !== null &&
      pointerId !== undefined &&
      pointerId !== this.activePointerId
    ) {
      return;
    }

    const dx = clientX - this.prevPointerX;
    const dy = clientY - this.prevPointerY;
    this.prevPointerX = clientX;
    this.prevPointerY = clientY;

    const sens = Math.max(0.2, Math.min(2.0, sensitivity)) * 0.0052;
    const ySign = invertY ? -1 : 1;

    // Update third-person follow yaw/pitch
    this.followYaw -= dx * sens;
    this.followPitch = THREE.MathUtils.clamp(
      this.followPitch + dy * sens * ySign,
      0.06,
      0.72
    );

    // Update overview orbit offsets
    this.orbitYawOffset = THREE.MathUtils.clamp(
      this.orbitYawOffset - dx * sens,
      -Math.PI * 0.45,
      Math.PI * 0.45
    );
    this.orbitPitchOffset = THREE.MathUtils.clamp(
      this.orbitPitchOffset + dy * sens * ySign,
      -0.32,
      0.38
    );
  }

  public onPointerUp(pointerId?: number): void {
    if (
      this.activePointerId !== null &&
      pointerId !== undefined &&
      pointerId !== this.activePointerId
    ) {
      return;
    }
    this.isDragging = false;
    this.activePointerId = null;
  }

  public applyKeyRotation(yawDelta: number, pitchDelta: number): void {
    this.followYaw -= yawDelta;
    this.followPitch = THREE.MathUtils.clamp(
      this.followPitch + pitchDelta,
      0.06,
      0.72
    );
    this.orbitYawOffset = THREE.MathUtils.clamp(
      this.orbitYawOffset + yawDelta,
      -Math.PI * 0.45,
      Math.PI * 0.45
    );
    this.orbitPitchOffset = THREE.MathUtils.clamp(
      this.orbitPitchOffset + pitchDelta,
      -0.32,
      0.38
    );
  }

  public update(
    camera: THREE.PerspectiveCamera,
    phase: GamePhase,
    cameraMode: CameraMode,
    viewpointId: CameraViewpointId,
    playerState: PlayerPhysicsState,
    elapsedTime: number,
    dt: number
  ): void {
    if (phase === 'character-creation' || phase === 'character-intro') {
      // Real-time 3D rotatable character preview camera framing protagonist on the right half of screen
      // Protagonist at (playerState.x, playerState.y, playerState.z) faces +Z (rotation.y = 0) during preview,
      // so placing the camera at +Z looks toward -Z (with Hoshino Academy behind the protagonist).
      const previewAngle =
        this.orbitYawOffset +
        (phase === 'character-intro' ? Math.sin(elapsedTime * 0.45) * 0.35 : 0);
      const dist = 2.6;
      const offsetShiftX = -Math.cos(previewAngle) * 0.78;
      const offsetShiftZ = Math.sin(previewAngle) * 0.78;
      _targetPos.set(
        playerState.x + Math.sin(previewAngle) * dist + offsetShiftX,
        playerState.y + 1.22,
        playerState.z + Math.cos(previewAngle) * dist + offsetShiftZ
      );
      _targetLook.set(
        playerState.x + offsetShiftX,
        playerState.y + 1.06,
        playerState.z + offsetShiftZ
      );
    } else if (
      phase === 'title' ||
      phase === 'loading' ||
      phase === 'exited' ||
      phase === 'story-library' ||
      phase === 'phase-selection'
    ) {
      // Live World Camera Tour / Parallax Pan framing Academy on the right two-thirds
      const sweep = Math.sin(elapsedTime * 0.22);
      const lift = Math.cos(elapsedTime * 0.16);
      _targetPos.set(9.0 + sweep * 5.5, 8.8 + lift * 1.1, 31.0 + lift * 2.5);
      _targetLook.set(-6.5 + sweep * 1.8, 7.5 + lift * 0.5, -12.0);
    } else if (cameraMode === 'follow') {
      // Phase 2, 4 & 5 Third-Person Spring-Arm Follow Camera (with indoor ceiling + wall raycast clearance)
      const indoor = isInsideSchoolBuilding(playerState.x, playerState.z);
      const followDist = indoor
        ? 2.85
        : playerState.isSprinting
          ? 5.6
          : 4.8;
      const effectivePitch = indoor ? Math.min(this.followPitch, 0.28) : this.followPitch;
      const horizDist = followDist * Math.cos(effectivePitch);
      const vertOffset = followDist * Math.sin(effectivePitch);

      const rawCamX = playerState.x + Math.sin(this.followYaw) * horizDist;
      const rawCamZ = playerState.z + Math.cos(this.followYaw) * horizDist;
      const safeCamXZ = clampCameraPositionAgainstWalls(
        playerState.x,
        playerState.z,
        rawCamX,
        rawCamZ,
        undefined,
        playerState.y
      );
      const rawCamY = Math.max(1.15, playerState.y + 1.45 + vertOffset);
      const camY = indoor ? Math.min(3.65, rawCamY) : rawCamY;

      _targetPos.set(safeCamXZ.x, camY, safeCamXZ.z);
      _targetLook.set(
        playerState.x - Math.sin(this.followYaw) * 1.4,
        playerState.y + 1.42,
        playerState.z - Math.cos(this.followYaw) * 1.4
      );

      // Subtle dynamic FOV boost when sprinting or inside classroom
      const targetFov = indoor ? 55 : playerState.isSprinting ? 56 : 50;
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = dampValue(camera.fov, targetFov, 6.0, dt);
        camera.updateProjectionMatrix();
      }
    } else {
      // Architectural Overview Camera Preset + Orbit Offset
      const vp = CAMERA_VIEWPOINTS[viewpointId] || CAMERA_VIEWPOINTS.courtyard_overview;
      const basePosX = vp.position[0];
      const basePosY = vp.position[1];
      const basePosZ = vp.position[2];
      const lookX = vp.target[0];
      const lookY = vp.target[1];
      const lookZ = vp.target[2];

      const relX = basePosX - lookX;
      const relZ = basePosZ - lookZ;
      const radius = Math.hypot(relX, relZ);
      const baseAngle = Math.atan2(relX, relZ);

      const finalAngle = baseAngle + this.orbitYawOffset;
      const finalY = Math.max(
        1.8,
        basePosY + this.orbitPitchOffset * Math.min(radius * 0.45, 12)
      );

      _targetPos.set(
        lookX + Math.sin(finalAngle) * radius,
        finalY,
        lookZ + Math.cos(finalAngle) * radius
      );
      _targetLook.set(lookX, lookY, lookZ);
    }

    if (phase === 'character-creation' || phase === 'character-intro') {
      this.currentPos.copy(_targetPos);
      this.currentLook.copy(_targetLook);
    } else {
      const lambda = cameraMode === 'follow' && phase === 'playing' ? 10.5 : 4.8;
      this.currentPos.set(
        dampValue(this.currentPos.x, _targetPos.x, lambda, dt),
        dampValue(this.currentPos.y, _targetPos.y, lambda, dt),
        dampValue(this.currentPos.z, _targetPos.z, lambda, dt)
      );
      this.currentLook.set(
        dampValue(this.currentLook.x, _targetLook.x, lambda, dt),
        dampValue(this.currentLook.y, _targetLook.y, lambda, dt),
        dampValue(this.currentLook.z, _targetLook.z, lambda, dt)
      );
    }

    camera.position.copy(this.currentPos);
    camera.lookAt(this.currentLook);
  }
}
