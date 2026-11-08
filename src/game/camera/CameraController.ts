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
  private targetZoomDist = 4.6;
  private currentZoomDist = 4.6;
  // Keep the third-person camera outside the character capsule at every zoom level.
  private readonly MIN_ZOOM_DIST = 2.6;
  private readonly MAX_ZOOM_DIST = 6.8;
  private readonly cameraRaycaster = new THREE.Raycaster();
  private readonly collisionDirection = new THREE.Vector3();
  private readonly collisionNormal = new THREE.Vector3();

  /**
   * Clamp the camera spring arm against actual rendered campus geometry.
   * The 2D wall clamp alone cannot prevent the camera entering roofs, trees,
   * lamp posts or large architectural meshes.
   */
  private resolveGeometryCollision(
    anchor: THREE.Vector3,
    desiredPosition: THREE.Vector3,
    collisionRoot?: THREE.Object3D
  ): void {
    if (!collisionRoot) return;

    this.collisionDirection.subVectors(desiredPosition, anchor);
    const desiredDistance = this.collisionDirection.length();
    if (desiredDistance < 0.2) return;

    this.collisionDirection.multiplyScalar(1 / desiredDistance);
    this.cameraRaycaster.set(anchor, this.collisionDirection);
    this.cameraRaycaster.near = 0.18;
    this.cameraRaycaster.far = desiredDistance;

    const hit = this.cameraRaycaster
      .intersectObject(collisionRoot, true)
      .find((candidate) => candidate.distance > 0.18 && candidate.distance < desiredDistance - 0.12);

    if (!hit) return;

    if (hit.face) {
      this.collisionNormal
        .copy(hit.face.normal)
        .transformDirection(hit.object.matrixWorld);
      if (this.collisionNormal.dot(this.collisionDirection) > 0) {
        this.collisionNormal.negate();
      }
      desiredPosition.copy(hit.point).addScaledVector(this.collisionNormal, 0.22);
    } else {
      desiredPosition.copy(anchor).addScaledVector(
        this.collisionDirection,
        Math.max(1.45, hit.distance - 0.18)
      );
    }
  }
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

  public getZoomDistance(): number {
    return this.currentZoomDist;
  }

  public setZoomDistance(dist: number): void {
    this.targetZoomDist = THREE.MathUtils.clamp(
      dist,
      this.MIN_ZOOM_DIST,
      this.MAX_ZOOM_DIST
    );
  }

  public onWheel(deltaY: number): void {
    const step = deltaY * 0.0032;
    this.setZoomDistance(this.targetZoomDist + step);
  }

  public getDistanceToCharacterHead(playerState: PlayerPhysicsState): number {
    const headY = playerState.y + 1.48;
    return Math.hypot(
      this.currentPos.x - playerState.x,
      this.currentPos.y - headY,
      this.currentPos.z - playerState.z
    );
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
    dt: number,
    collisionRoot?: THREE.Object3D
  ): void {
    if (phase === 'character-creation' || phase === 'character-intro') {
      // Real-time 3D rotatable character preview camera framing protagonist on the right half of screen
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
      // Smoothly damp zoom distance
      this.currentZoomDist = dampValue(
        this.currentZoomDist,
        this.targetZoomDist,
        12.0,
        dt
      );

      // Third-Person Spring-Arm Follow Camera (with indoor ceiling + wall raycast + anti-body-clipping)
      const indoor = isInsideSchoolBuilding(playerState.x, playerState.z);
      const baseDist = indoor
        ? Math.min(this.currentZoomDist, 2.95)
        : this.currentZoomDist;
      const followDist = Math.max(
        this.MIN_ZOOM_DIST,
        baseDist + (playerState.isSprinting && !indoor ? 0.55 : 0)
      );
      const effectivePitch = indoor ? Math.min(this.followPitch, 0.28) : this.followPitch;
      const horizDist = Math.max(1.38, followDist * Math.cos(effectivePitch));
      const vertOffset = followDist * Math.sin(effectivePitch);

      const rawCamX = playerState.x + Math.sin(this.followYaw) * horizDist;
      const rawCamZ = playerState.z + Math.cos(this.followYaw) * horizDist;
      const safeCamXZ = clampCameraPositionAgainstWalls(
        playerState.x,
        playerState.z,
        rawCamX,
        rawCamZ
      );

      let camX = safeCamXZ.x;
      let camZ = safeCamXZ.z;
      const rawCamY = Math.max(1.18, playerState.y + 1.46 + vertOffset);
      let camY = indoor ? Math.min(3.65, rawCamY) : rawCamY;

      // CRITICAL ANTI-BODY-CLIPPING SAFEGUARD:
      // Never allow the camera to sit inside the character's head/torso sphere (radius ~0.42m).
      const dxFromPlayer = camX - playerState.x;
      const dzFromPlayer = camZ - playerState.z;
      const horizDistFromPlayer = Math.hypot(dxFromPlayer, dzFromPlayer);

      if (horizDistFromPlayer < 1.38) {
        const closeRatio = 1 - horizDistFromPlayer / 1.38;
        camY = Math.min(
          indoor ? 3.7 : 4.5,
          Math.max(camY, playerState.y + 1.56 + closeRatio * 0.26)
        );
        if (horizDistFromPlayer < 1.18) {
          const dirX =
            horizDistFromPlayer > 0.01
              ? dxFromPlayer / horizDistFromPlayer
              : Math.sin(this.followYaw);
          const dirZ =
            horizDistFromPlayer > 0.01
              ? dzFromPlayer / horizDistFromPlayer
              : Math.cos(this.followYaw);
          camX = playerState.x + dirX * 1.18;
          camZ = playerState.z + dirZ * 1.18;
        }
      }

      _targetPos.set(camX, camY, camZ);

      // Adaptive look-at target: reduce forward lead when zoomed close so the camera never looks THROUGH the head!
      const effectiveHorizDist = Math.hypot(
        camX - playerState.x,
        camZ - playerState.z
      );
      const forwardLead = THREE.MathUtils.clamp(
        (effectiveHorizDist - 1.65) * 0.42,
        0.0,
        1.25
      );
      _targetLook.set(
        playerState.x - Math.sin(this.followYaw) * forwardLead,
        playerState.y + 1.44,
        playerState.z - Math.cos(this.followYaw) * forwardLead
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
      const lambda = cameraMode === 'follow' && phase === 'playing' ? 12.5 : 4.8;
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

    // Apply collision both before and after damping so the interpolated camera
    // cannot drift through a wall, ceiling, tree canopy or lamp post.
    if (phase === 'playing' && cameraMode === 'follow' && collisionRoot) {
      const anchor = new THREE.Vector3(
        playerState.x,
        playerState.y + 1.28,
        playerState.z
      );
      this.resolveGeometryCollision(anchor, _targetPos, collisionRoot);
      this.resolveGeometryCollision(anchor, this.currentPos, collisionRoot);
    }

    camera.position.copy(this.currentPos);
    camera.lookAt(this.currentLook);
  }
}
