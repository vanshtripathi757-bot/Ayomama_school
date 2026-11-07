import * as THREE from 'three';

export interface ExpandedFacilityRefs {
  rootGroup: THREE.Group;
  dispose: () => void;
}

/** A walk-in medical room with a real doorway, reception desk, beds and clinic signage. */
export function buildExpandedFacilities(): ExpandedFacilityRefs {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ExpandedMedicalFacility';
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const geo = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.push(value);
    return value;
  };
  const mat = <T extends THREE.Material>(value: T): T => {
    materials.push(value);
    return value;
  };

  const wall = mat(new THREE.MeshStandardMaterial({ color: 0xe8e7df, roughness: 0.82 }));
  const trim = mat(new THREE.MeshStandardMaterial({ color: 0x26364b, roughness: 0.58, metalness: 0.16 }));
  const floor = mat(new THREE.MeshStandardMaterial({ color: 0xc8d2d0, roughness: 0.72 }));
  const glass = mat(new THREE.MeshStandardMaterial({ color: 0x9bc7d8, roughness: 0.2, metalness: 0.12, transparent: true, opacity: 0.72 }));
  const clinicRed = mat(new THREE.MeshStandardMaterial({ color: 0xc83b4b, emissive: 0x5b1019, emissiveIntensity: 0.18, roughness: 0.45 }));
  const linen = mat(new THREE.MeshStandardMaterial({ color: 0xf4f7f8, roughness: 0.9 }));
  const wood = mat(new THREE.MeshStandardMaterial({ color: 0x876b53, roughness: 0.72 }));
  const metal = mat(new THREE.MeshStandardMaterial({ color: 0x7d8b95, metalness: 0.72, roughness: 0.32 }));

  const addBox = (
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    material: THREE.Material,
    castShadow = true
  ) => {
    const mesh = new THREE.Mesh(geo(new THREE.BoxGeometry(...size)), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    rootGroup.add(mesh);
    return mesh;
  };

  const cx = 34;
  const cz = -27;
  // Floor and shell; the south wall is split to leave a 4m accessible doorway.
  addBox('clinic-floor', [14, 0.22, 14], [cx, 0.02, cz], floor, false);
  addBox('clinic-north-wall', [14, 6.6, 0.55], [cx, 3.3, cz - 6.72], wall);
  addBox('clinic-west-wall', [0.55, 6.6, 13.5], [cx - 6.72, 3.3, cz], wall);
  addBox('clinic-east-wall', [0.55, 6.6, 13.5], [cx + 6.72, 3.3, cz], wall);
  addBox('clinic-front-left', [4.0, 6.6, 0.55], [cx - 5.0, 3.3, cz + 6.72], wall);
  addBox('clinic-front-right', [4.0, 6.6, 0.55], [cx + 5.0, 3.3, cz + 6.72], wall);
  addBox('clinic-roof', [15.2, 0.55, 15.2], [cx, 6.75, cz], trim);

  // Entrance canopy and a clear medical cross visible from the approach.
  addBox('clinic-entry-canopy', [5.2, 0.28, 1.5], [cx, 5.95, cz + 7.45], trim);
  addBox('clinic-sign-panel', [4.4, 1.0, 0.18], [cx, 5.35, cz + 7.0], linen);
  addBox('clinic-cross-vertical', [0.28, 0.78, 0.12], [cx - 1.35, 5.35, cz + 6.88], clinicRed);
  addBox('clinic-cross-horizontal', [0.78, 0.28, 0.12], [cx - 1.35, 5.35, cz + 6.88], clinicRed);

  // Glazed front windows flanking the entry.
  addBox('clinic-window-left', [3.2, 2.4, 0.1], [cx - 5.0, 3.5, cz + 6.38], glass, false);
  addBox('clinic-window-right', [3.2, 2.4, 0.1], [cx + 5.0, 3.5, cz + 6.38], glass, false);

  // Reception and medical supplies.
  addBox('clinic-reception-counter', [4.2, 1.05, 1.1], [cx, 0.72, cz + 4.25], wood);
  addBox('clinic-counter-top', [4.35, 0.12, 1.2], [cx, 1.3, cz + 4.25], trim);
  addBox('clinic-storage-cabinet', [1.1, 2.0, 0.65], [cx - 5.2, 1.1, cz - 3.5], linen);
  addBox('clinic-medical-monitor', [1.0, 0.72, 0.12], [cx + 4.9, 1.65, cz - 4.2], trim, false);
  addBox('clinic-monitor-screen', [0.82, 0.52, 0.04], [cx + 4.9, 1.68, cz - 4.12], glass, false);

  // Two patient beds with pillows, rails and compact bedside stands.
  for (const [index, bx] of [-2.8, 2.8].entries()) {
    const x = cx + bx;
    const z = cz - 1.8;
    addBox(`clinic-bed-${index + 1}-base`, [2.1, 0.42, 3.0], [x, 0.48, z], metal);
    addBox(`clinic-bed-${index + 1}-mattress`, [2.0, 0.22, 2.9], [x, 0.78, z], linen);
    addBox(`clinic-bed-${index + 1}-pillow`, [1.1, 0.16, 0.55], [x, 0.98, z - 1.0], linen);
    addBox(`clinic-bed-${index + 1}-headboard`, [2.1, 0.85, 0.12], [x, 0.92, z - 1.52], trim);
    addBox(`clinic-bed-${index + 1}-rail`, [0.1, 0.45, 2.2], [x + 1.0, 0.92, z + 0.15], metal);
    addBox(`clinic-bedside-${index + 1}`, [0.72, 0.72, 0.72], [x - 1.45, 0.42, z + 0.75], wood);
  }

  // Soft interior lighting.
  const ceilingLight = new THREE.PointLight(0xe5f4ff, 1.1, 18, 1.6);
  ceilingLight.position.set(cx, 5.4, cz);
  rootGroup.add(ceilingLight);

  return {
    rootGroup,
    dispose: () => {
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
      ceilingLight.dispose();
    },
  };
}
