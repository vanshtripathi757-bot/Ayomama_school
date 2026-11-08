import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface ImportedStudentRig {
  root: THREE.Group;
  update: (time: number, moving: boolean, speed?: number, greeting?: boolean, greetingType?: string, posture?: string) => void;
  dispose: () => void;
}

type Segment = 'head' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'torso';

/**
 * Loads the supplied unskinned Sketchfab GLB and gives its separately-exported
 * mesh parts a lightweight rigid-part rig. This is deliberately not advertised
 * as a deforming skin rig: a true skin rig requires artist-reviewed weights.
 */
export async function loadImportedStudentRig(
  url = '/models/Conejacolegiala_.glb'
): Promise<ImportedStudentRig> {
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;
  root.name = 'ImportedSchoolGirlModel';

  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) {
    throw new Error('Imported student model has invalid bounds');
  }

  // Normalize to a school-student height and place both feet on y = 0.
  const scale = 1.68 / size.y;
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  root.updateMatrixWorld(true);

  const scaledBounds = new THREE.Box3().setFromObject(root);
  const scaledSize = scaledBounds.getSize(new THREE.Vector3());
  const segmentPivots: Record<Segment, THREE.Group> = {
    head: new THREE.Group(),
    leftArm: new THREE.Group(),
    rightArm: new THREE.Group(),
    leftLeg: new THREE.Group(),
    rightLeg: new THREE.Group(),
    torso: new THREE.Group(),
  };

  const pivotAt = (segment: Segment, x: number, y: number, z: number) => {
    const pivot = segmentPivots[segment];
    pivot.name = `ImportedStudent_${segment}`;
    pivot.position.copy(root.worldToLocal(new THREE.Vector3(x, y, z)));
    root.add(pivot);
  };
  pivotAt('head', 0, scaledSize.y * 0.82, 0);
  pivotAt('leftArm', -scaledSize.x * 0.22, scaledSize.y * 0.73, 0);
  pivotAt('rightArm', scaledSize.x * 0.22, scaledSize.y * 0.73, 0);
  pivotAt('leftLeg', -scaledSize.x * 0.10, scaledSize.y * 0.43, 0);
  pivotAt('rightLeg', scaledSize.x * 0.10, scaledSize.y * 0.43, 0);
  pivotAt('torso', 0, scaledSize.y * 0.54, 0);

  const torsoBaseY = segmentPivots.torso.position.y;
  const meshes: THREE.Mesh[] = [];
  root.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh);
  });

  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false);
    const meshBounds = new THREE.Box3().setFromObject(mesh);
    const worldCenter = meshBounds.getCenter(new THREE.Vector3());
    const nx = worldCenter.x / Math.max(0.001, scaledSize.x);
    const ny = worldCenter.y / Math.max(0.001, scaledSize.y);
    let segment: Segment = 'torso';

    if (ny > 0.78) segment = 'head';
    else if (ny < 0.39 && Math.abs(nx) > 0.055) {
      segment = nx < 0 ? 'leftLeg' : 'rightLeg';
    } else if (ny > 0.43 && ny < 0.86 && Math.abs(nx) > 0.17) {
      segment = nx < 0 ? 'leftArm' : 'rightArm';
    }

    // Object3D.attach preserves the mesh's world transform while changing parent.
    segmentPivots[segment].attach(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  const group = new THREE.Group();
  group.name = 'ImportedStudentActor';
  group.add(root);
  group.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if ('roughness' in material && typeof material.roughness === 'number') {
          material.roughness = Math.max(0.38, material.roughness);
        }
      }
    }
  });

  const update = (time: number, moving: boolean, speed = 1, greeting = false, greetingType = 'wave', posture = 'none') => {
    const gait = moving ? Math.sin(time * 9.5) * Math.min(1, Math.max(0.25, speed)) : 0;
    const waving = greeting && greetingType === 'wave';
    const bowing = greeting && greetingType === 'bow';
    const seated = posture === 'sit';
    segmentPivots.leftArm.rotation.x = gait * 0.42;
    segmentPivots.rightArm.rotation.x = waving
      ? -0.95 + Math.sin(time * 10) * 0.24
      : -gait * 0.42;
    segmentPivots.rightArm.rotation.z = waving ? -0.18 : 0;
    segmentPivots.leftLeg.rotation.x = seated ? -1.05 : -gait * 0.48;
    segmentPivots.rightLeg.rotation.x = seated ? -1.05 : gait * 0.48;
    segmentPivots.head.rotation.x = bowing ? 0.32 : Math.sin(time * 1.7) * 0.025;
    segmentPivots.head.rotation.y = Math.sin(time * 0.7) * 0.045;
    segmentPivots.torso.position.y = torsoBaseY + (moving ? Math.abs(gait) * 0.012 / scale : Math.sin(time * 1.8) * 0.004 / scale);
    segmentPivots.torso.rotation.x = bowing ? 0.16 : 0;
    segmentPivots.torso.rotation.z = moving ? gait * 0.025 : Math.sin(time * 0.9) * 0.012;
  };

  const dispose = () => {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    group.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        geometries.add(mesh.geometry);
        const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        meshMaterials.forEach((material) => materials.add(material));
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  };

  return { root: group, update, dispose };
}
