import * as THREE from 'three';

export interface AdvancedCampusFacilityRefs {
  rootGroup: THREE.Group;
  dispose: () => void;
}

/** Walk-in science, computer and auditorium interiors for the expanded academy grounds. */
export function buildAdvancedCampusFacilities(): AdvancedCampusFacilityRefs {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'AdvancedCampusFacilities';
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

  const wallMat = mat(new THREE.MeshStandardMaterial({ color: 0xe6e9ef, roughness: 0.84 }));
  const floorMat = mat(new THREE.MeshStandardMaterial({ color: 0xb9c6ca, roughness: 0.76 }));
  const trimMat = mat(new THREE.MeshStandardMaterial({ color: 0x26364b, roughness: 0.55, metalness: 0.2 }));
  const woodMat = mat(new THREE.MeshStandardMaterial({ color: 0x8b6b50, roughness: 0.72 }));
  const glassMat = mat(new THREE.MeshStandardMaterial({ color: 0x9bd5e8, roughness: 0.24, metalness: 0.12, transparent: true, opacity: 0.82 }));
  const scienceMat = mat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x075985, emissiveIntensity: 0.2, roughness: 0.38 }));
  const screenMat = mat(new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x1d4ed8, emissiveIntensity: 0.45, roughness: 0.22 }));
  const seatMat = mat(new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.58 }));

  const box = (
    parent: THREE.Group,
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    material: THREE.Material
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo(new THREE.BoxGeometry(...size)), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const buildWalkInShell = (
    name: string,
    centerX: number,
    centerZ: number,
    width: number,
    depth: number,
    regionId: string
  ) => {
    const group = new THREE.Group();
    group.name = name;
    group.userData.streamRegionId = regionId;
    group.userData.streamCenter = { x: centerX, z: centerZ };
    const halfW = width / 2;
    const halfD = depth / 2;
    box(group, `${name}-floor`, [width, 0.18, depth], [0, 0.09, 0], floorMat);
    box(group, `${name}-west-wall`, [0.32, 4.6, depth], [-halfW + 0.16, 2.3, 0], wallMat);
    box(group, `${name}-east-wall`, [0.32, 4.6, depth], [halfW - 0.16, 2.3, 0], wallMat);
    box(group, `${name}-back-wall`, [width, 4.6, 0.32], [0, 2.3, -halfD + 0.16], wallMat);
    box(group, `${name}-front-left`, [halfW - 2.5, 4.6, 0.32], [-(halfW + 2.5) / 2, 2.3, halfD - 0.16], wallMat);
    box(group, `${name}-front-right`, [halfW - 2.5, 4.6, 0.32], [(halfW + 2.5) / 2, 2.3, halfD - 0.16], wallMat);
    box(group, `${name}-entry-header`, [5.0, 0.7, 0.32], [0, 4.25, halfD - 0.16], trimMat);
    box(group, `${name}-sign`, [5.8, 0.8, 0.2], [0, 4.95, halfD + 0.06], trimMat);
    return group;
  };

  // Science laboratory: safe classroom-style benches, microscopes and display apparatus.
  const science = buildWalkInShell('HoshinoScienceLaboratory', -70, -60, 18, 14, 'science-lab');
  science.position.set(-70, 0, -60);
  for (const x of [-5.0, 0, 5.0]) {
    box(science, 'science-lab-bench', [3.6, 0.22, 2.0], [x, 0.95, -1.2], woodMat);
    box(science, 'science-lab-bench-leg-left', [0.16, 0.82, 0.16], [x - 1.45, 0.45, -1.2], trimMat);
    box(science, 'science-lab-bench-leg-right', [0.16, 0.82, 0.16], [x + 1.45, 0.45, -1.2], trimMat);
    box(science, 'science-lab-display-tray', [1.5, 0.12, 0.8], [x, 1.12, -1.2], scienceMat);
    box(science, 'science-lab-instrument', [0.48, 0.65, 0.48], [x - 0.8, 1.45, -1.2], trimMat);
  }
  box(science, 'science-lab-teacher-table', [4.2, 0.82, 1.2], [0, 0.5, -5.0], woodMat);
  box(science, 'science-lab-periodic-display', [6.0, 1.8, 0.14], [0, 2.5, -6.7], scienceMat);
  const scienceLight = new THREE.PointLight(0x9bd5ff, 0.85, 20, 1.7);
  scienceLight.position.set(0, 3.8, 0);
  science.add(scienceLight);
  rootGroup.add(science);

  // Computer laboratory: six usable workstations with monitor, keyboard and desk geometry.
  const computer = buildWalkInShell('HoshinoComputerLaboratory', 70, -60, 18, 14, 'computer-lab');
  computer.position.set(70, 0, -60);
  for (const rowZ of [-2.2, 1.8]) {
    for (const x of [-5.2, 0, 5.2]) {
      box(computer, 'computer-workstation-desk', [3.0, 0.18, 1.35], [x, 0.82, rowZ], woodMat);
      box(computer, 'computer-monitor-base', [0.75, 0.08, 0.38], [x, 0.96, rowZ - 0.25], trimMat);
      box(computer, 'computer-monitor', [1.15, 0.78, 0.12], [x, 1.38, rowZ - 0.35], trimMat);
      box(computer, 'computer-monitor-screen', [0.98, 0.58, 0.035], [x, 1.39, rowZ - 0.275], screenMat);
      box(computer, 'computer-keyboard', [0.9, 0.05, 0.3], [x, 0.96, rowZ + 0.34], glassMat);
      box(computer, 'computer-tower', [0.42, 0.72, 0.62], [x + 1.05, 0.42, rowZ], trimMat);
    }
  }
  box(computer, 'computer-lab-instructor-desk', [4.2, 0.82, 1.2], [0, 0.5, -5.0], woodMat);
  box(computer, 'computer-lab-wall-display', [6.0, 1.8, 0.14], [0, 2.5, -6.7], screenMat);
  const computerLight = new THREE.PointLight(0x93c5fd, 0.8, 20, 1.7);
  computerLight.position.set(0, 3.8, 0);
  computer.add(computerLight);
  rootGroup.add(computer);

  // Auditorium: walk-in foyer, low stage, podium and eight rows of audience seating.
  const auditorium = buildWalkInShell('HoshinoAcademyAuditorium', 0, 57, 24, 20, 'auditorium');
  auditorium.position.set(0, 0, 57);
  box(auditorium, 'auditorium-stage', [16, 0.7, 3.4], [0, 0.42, -7.2], woodMat);
  box(auditorium, 'auditorium-stage-backdrop', [16, 3.0, 0.2], [0, 2.0, -9.4], trimMat);
  box(auditorium, 'auditorium-podium', [0.9, 1.3, 0.72], [0, 1.0, -5.8], woodMat);
  for (const rowZ of [-3.2, 0.0, 3.2, 6.0]) {
    for (const x of [-8.0, -4.0, 0, 4.0, 8.0]) {
      box(auditorium, 'auditorium-seat-base', [1.05, 0.18, 0.95], [x, 0.55, rowZ], seatMat);
      box(auditorium, 'auditorium-seat-back', [1.05, 0.95, 0.16], [x, 1.08, rowZ + 0.42], seatMat);
    }
  }
  box(auditorium, 'auditorium-light-bar', [18, 0.24, 0.3], [0, 4.3, -7.5], trimMat);
  const auditoriumLight = new THREE.PointLight(0xfde68a, 1.0, 26, 1.6);
  auditoriumLight.position.set(0, 4.1, 0);
  auditorium.add(auditoriumLight);
  rootGroup.add(auditorium);

  return {
    rootGroup,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
