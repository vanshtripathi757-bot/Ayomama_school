import * as THREE from 'three';
import { ProceduralTextureSet } from './ProceduralTextures';

export interface AcademyEnvironmentRefs {
  rootGroup: THREE.Group;
  facadeMaterial: THREE.MeshStandardMaterial;
  lanternBulbMaterial: THREE.MeshStandardMaterial;
  lanternPointLights: THREE.PointLight[];
  petalInstancedMesh: THREE.InstancedMesh;
  petalData: Array<{
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    rx: number;
    ry: number;
    scale: number;
  }>;
  clockHourHand: THREE.Mesh;
  clockMinuteHand: THREE.Mesh;
  fountainWaterRing: THREE.Mesh;
  cloudGroup: THREE.Group;
  cloudMaterial: THREE.MeshStandardMaterial;
  celestialDisc: THREE.Mesh;
  doorPivots: Record<string, THREE.Group>;
  dispose: () => void;
}

export function buildAcademyEnvironment(
  textures: ProceduralTextureSet
): AcademyEnvironmentRefs {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'SeiranAcademyEnvironmentV8';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const doorPivots: Record<string, THREE.Group> = {};

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // ==========================================================================
  // SHARED ARCHITECTURAL PBR MATERIALS (Modern Japanese Elite Academy)
  // ==========================================================================
  const courtyardMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.courtyardTileColor,
      bumpMap: textures.courtyardTileBump,
      bumpScale: 0.03,
      roughness: 0.76,
      metalness: 0.06,
    })
  );

  const grassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x2d4c3e,
      roughness: 0.92,
      metalness: 0.02,
    })
  );

  const facadeMaterial = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.academyFacadeColor,
      emissiveMap: textures.academyFacadeEmissive,
      emissive: new THREE.Color('#ffcb7d'),
      emissiveIntensity: 0.85,
      roughness: 0.62,
      metalness: 0.14,
    })
  );

  const roofMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.roofSlateColor,
      bumpMap: textures.roofSlateBump,
      bumpScale: 0.04,
      roughness: 0.52,
      metalness: 0.24,
    })
  );

  const creamWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe6e3dc,
      roughness: 0.7,
      metalness: 0.05,
    })
  );

  const concreteStoneMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.68,
      metalness: 0.12,
    })
  );

  const interiorWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf5f2eb,
      roughness: 0.74,
      metalness: 0.04,
    })
  );

  const interiorFloorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc8a97e,
      roughness: 0.42,
      metalness: 0.08,
    })
  );

  const hallwayTileMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd8d5ce,
      roughness: 0.36,
      metalness: 0.12,
    })
  );

  const darkTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e2638,
      roughness: 0.45,
      metalness: 0.42,
    })
  );

  const stoneMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x949ba6,
      roughness: 0.78,
      metalness: 0.08,
    })
  );

  const glassCurtainMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: 0x0369a1,
      emissiveIntensity: 0.28,
      roughness: 0.14,
      metalness: 0.55,
      transparent: true,
      opacity: 0.68,
    })
  );

  const waterMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.86,
    })
  );

  const woodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x6b442a,
      roughness: 0.8,
      metalness: 0.04,
    })
  );

  const lightWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xa47551,
      roughness: 0.62,
      metalness: 0.06,
    })
  );

  const chalkboardMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x134e3a,
      roughness: 0.68,
      metalness: 0.05,
    })
  );

  const screenGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.3,
    })
  );

  const trackClayMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb4533c,
      roughness: 0.85,
      metalness: 0.03,
    })
  );

  const sakuraFoliageMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf4a8c0,
      roughness: 0.75,
      metalness: 0.02,
    })
  );

  const lanternBulbMaterial = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffb347,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    })
  );

  const goldAccentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      roughness: 0.28,
      metalness: 0.82,
    })
  );

  const crimsonMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.55,
      metalness: 0.08,
    })
  );

  // Helper to build a functional hinged door that registers in `doorPivots`
  const createHingedDoor = (
    doorId: string,
    hingeX: number,
    hingeZ: number,
    baseRotationY: number,
    accentHex: number
  ) => {
    const pivot = new THREE.Group();
    pivot.position.set(hingeX, 0, hingeZ);
    pivot.rotation.y = baseRotationY;
    pivot.userData = { baseRotationY };

    const panel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.15, 2.45, 0.1)),
      lightWoodMat
    );
    panel.position.set(0.58, 1.25, 0);
    panel.castShadow = true;
    pivot.add(panel);

    const windowInsert = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.65, 0.9, 0.12)),
      glassCurtainMat
    );
    windowInsert.position.set(0.58, 1.65, 0);
    pivot.add(windowInsert);

    const classPlaca = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.52, 0.18, 0.13)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: accentHex,
          emissive: accentHex,
          emissiveIntensity: 0.35,
          roughness: 0.3,
        })
      )
    );
    classPlaca.position.set(0.58, 2.22, 0);
    pivot.add(classPlaca);

    const handle = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.05, 0.18)),
      goldAccentMat
    );
    handle.position.set(1.02, 1.1, 0);
    pivot.add(handle);

    doorPivots[doorId] = pivot;
    rootGroup.add(pivot);
  };

  // Helper to populate a Classroom with Blackboard, Teacher Podium, Desks, Chairs, Clock & AC
  const buildClassroomFurniture = (
    parent: THREE.Group,
    centerX: number,
    centerZ: number,
    cols: number[],
    rows: number[],
    boardZ: number,
    classColorHex: number
  ) => {
    // Blackboard & Frame
    const boardFrame = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(6.8, 1.95, 0.14)),
      woodMat
    );
    boardFrame.position.set(centerX, 2.25, boardZ);
    parent.add(boardFrame);

    const boardSurface = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(6.4, 1.7, 0.18)),
      chalkboardMat
    );
    boardSurface.position.set(centerX, 2.25, boardZ + 0.02);
    parent.add(boardSurface);

    // Class Crest Header Banner above Blackboard
    const classBanner = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.6, 0.36, 0.2)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: classColorHex,
          emissive: classColorHex,
          emissiveIntensity: 0.35,
          roughness: 0.35,
        })
      )
    );
    classBanner.position.set(centerX, 3.45, boardZ + 0.03);
    parent.add(classBanner);

    // Wall Clock above Blackboard
    const clockCase = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16)),
      lanternBulbMaterial
    );
    clockCase.rotation.x = Math.PI / 2;
    clockCase.position.set(centerX + 2.8, 3.45, boardZ + 0.05);
    parent.add(clockCase);

    // Teacher Podium & Desk
    const podium = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.0, 1.02, 1.0)),
      woodMat
    );
    podium.position.set(centerX, 0.51, boardZ + 2.1);
    podium.castShadow = true;
    parent.add(podium);

    // Student Desks + Chairs (3-part composite appearance)
    const deskTopGeo = trackGeo(new THREE.BoxGeometry(1.3, 0.74, 0.82));
    const chairSeatGeo = trackGeo(new THREE.BoxGeometry(0.62, 0.45, 0.62));
    const chairBackGeo = trackGeo(new THREE.BoxGeometry(0.62, 0.44, 0.08));

    for (const dx of cols) {
      for (const dz of rows) {
        const desk = new THREE.Mesh(deskTopGeo, lightWoodMat);
        desk.position.set(dx, 0.37, dz);
        desk.castShadow = true;
        desk.receiveShadow = true;
        parent.add(desk);

        const seat = new THREE.Mesh(chairSeatGeo, darkTrimMat);
        seat.position.set(dx, 0.225, dz + 0.68);
        seat.castShadow = true;
        parent.add(seat);

        const back = new THREE.Mesh(chairBackGeo, woodMat);
        back.position.set(dx, 0.64, dz + 0.96);
        parent.add(back);
      }
    }
  };

  // ==========================================================================
  // 1. GRAND HOSHINO ACADEMY WORLD GROUND PLANES, COURTYARD PLAZA, ROADS & WALKWAYS
  // ==========================================================================
  const outerGround = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(540, 540)),
    grassMat
  );
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.position.y = -0.05;
  outerGround.receiveShadow = true;
  rootGroup.add(outerGround);

  // Main Courtyard Paved Plaza
  const courtyardPlaza = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(72, 0.14, 56)),
    courtyardMat
  );
  courtyardPlaza.position.set(0, 0.02, 10);
  courtyardPlaza.receiveShadow = true;
  rootGroup.add(courtyardPlaza);

  // Covered Walkway Colonade Canopies flanking the Courtyard (East & West)
  const colonnadeRoofGeo = trackGeo(new THREE.BoxGeometry(3.6, 0.32, 26.0));
  const colonnadePostGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.18, 3.6, 8));
  for (const colX of [-14.2, 14.2]) {
    const canopy = new THREE.Mesh(colonnadeRoofGeo, darkTrimMat);
    canopy.position.set(colX, 3.65, 18.0);
    canopy.castShadow = true;
    rootGroup.add(canopy);

    for (let pz = 6.0; pz <= 30.0; pz += 6.0) {
      const post = new THREE.Mesh(colonnadePostGeo, concreteStoneMat);
      post.position.set(colX, 1.8, pz);
      post.castShadow = true;
      rootGroup.add(post);
    }
  }

  // Extended East-West Grand Promenade connecting West Koi Garden (-86) to East Research & Pool (+86)
  const crossWalkway = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(188, 0.15, 8.6)),
    courtyardMat
  );
  crossWalkway.position.set(0, 0.025, 8);
  crossWalkway.receiveShadow = true;
  rootGroup.add(crossWalkway);

  // Extended South Town Boulevard connecting Main Gate (z=35) to Hoshino Train Station (z=94)
  const approachPath = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(18, 0.16, 76)),
    courtyardMat
  );
  approachPath.position.set(0, 0.03, 60);
  approachPath.receiveShadow = true;
  rootGroup.add(approachPath);

  // Extended North Shrine Stone Path connecting North Track (z=-45) to Mountain Torii Shrine (z=-90)
  const northShrinePath = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.5, 0.15, 52)),
    courtyardMat
  );
  northShrinePath.position.set(0, 0.028, -66);
  northShrinePath.receiveShadow = true;
  rootGroup.add(northShrinePath);

  // ==========================================================================
  // 2. MULTI-WING WALKABLE ACADEMIC COMPLEX:
  //    - Central Lobby, Reception, Lockers, Elevator & Water Fountain
  //    - CLASS A CLASSROOM (North-West Main Wing: x = -14.2, z = -16.1)
  //    - CLASS B CLASSROOM (South-West Wing: x = -21.2, z = -2.5)
  //    - CLASS C CLASSROOM (South-East Wing: x = +21.2, z = -2.5)
  //    - CLASS D CLASSROOM (West Annex: x = -30.5, z = -16.1)
  //    - MULTI-SECTION LIBRARY (East Main Wing: x = +14.2, z = -16.1)
  //    - COMPUTER LAB & TECH ANNEX (East Annex: x = +30.5, z = -16.1)
  // ==========================================================================
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'WalkableSchoolInteriorV8';
  rootGroup.add(interiorGroup);

  // 2A. Ground-Floor Walkable Floors for All 4 Classrooms, Lobby, Library & Computer Lab
  const mainComplexFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(72.0, 0.16, 12.6)),
    interiorFloorMat
  );
  mainComplexFloor.position.set(0, 0.04, -16.1);
  mainComplexFloor.receiveShadow = true;
  interiorGroup.add(mainComplexFloor);

  const lobbyHallwayFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(11.4, 0.18, 12.6)),
    hallwayTileMat
  );
  lobbyHallwayFloor.position.set(0, 0.05, -16.1);
  lobbyHallwayFloor.receiveShadow = true;
  interiorGroup.add(lobbyHallwayFloor);

  // Class B (South-West Wing) & Class C (South-East Wing) Walkable Wood Floors
  for (const sideX of [-21.2, 21.2]) {
    const wingFloor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(12.2, 0.16, 13.8)),
      interiorFloorMat
    );
    wingFloor.position.set(sideX, 0.04, -2.5);
    wingFloor.receiveShadow = true;
    interiorGroup.add(wingFloor);
  }

  // Welcoming Entrance Mat at Front Door (0, 0.07, -10.2)
  const welcomeMat = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.6, 0.06, 2.2)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.9,
      })
    )
  );
  welcomeMat.position.set(0, 0.07, -10.2);
  interiorGroup.add(welcomeMat);

  // 2B. Perimeter & Partition Walls with Open Doorways for All 4 Classrooms + Library + Computer Lab
  // Front South Wall Left & Right (leaving x: -2.8..+2.8 open for the Front Entrance!)
  for (const fx of [-19.4, 19.4]) {
    const frontWall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(33.2, 4.5, 0.42)),
      facadeMaterial
    );
    frontWall.position.set(fx, 2.25, -9.8);
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    interiorGroup.add(frontWall);
  }

  // Back North Wall Left & Right (leaving x: -2.8..+2.8 open to walk out to the North Sports Field!)
  for (const bx of [-19.4, 19.4]) {
    const backWall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(33.2, 4.5, 0.42)),
      interiorWallMat
    );
    backWall.position.set(bx, 2.25, -22.3);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    interiorGroup.add(backWall);
  }

  // Far West Annex Wall (x = -36.0) & Far East Tech Annex Wall (x = +36.0)
  for (const ex of [-36.0, 36.0]) {
    const endWall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.45, 4.5, 12.8)),
      facadeMaterial
    );
    endWall.position.set(ex, 2.25, -16.05);
    endWall.castShadow = true;
    interiorGroup.add(endWall);
  }

  // Partition Walls with Wide 4.4m Open Doorways at x = -22.8 (Class D), -5.6 (Class A), +5.6 (Library), +22.8 (Computer Lab)
  for (const partX of [-22.8, -5.6, 5.6, 22.8]) {
    const southSeg = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.32, 4.5, 3.8)),
      interiorWallMat
    );
    southSeg.position.set(partX, 2.25, -11.8);
    interiorGroup.add(southSeg);

    const northSeg = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.32, 4.5, 3.8)),
      interiorWallMat
    );
    northSeg.position.set(partX, 2.25, -20.3);
    interiorGroup.add(northSeg);
  }

  // Functional Hinged Doors for Main Entrance, Class A, Class B, Class C, Class D, and Library
  createHingedDoor('door_main_front', -2.6, -9.6, 0.35, 0xfbbf24);
  createHingedDoor('door_class_a', -5.6, -14.0, 0.45, 0xe11d48);
  createHingedDoor('door_class_b', -15.0, -0.8, 0.45, 0x38bdf8);
  createHingedDoor('door_class_c', 15.0, -0.8, 2.65, 0xa855f7);
  createHingedDoor('door_class_d', -22.8, -14.0, 0.45, 0x10b981);
  createHingedDoor('door_library', 5.6, -14.0, 2.65, 0xf59e0b);

  // 2C. Central Lobby Details: Reception Desk, Shoe Lockers (Getabako), Elevator & Water Fountain
  const lockerGeo = trackGeo(new THREE.BoxGeometry(0.55, 2.1, 3.2));
  for (const lx of [-4.9, 4.9]) {
    const locker = new THREE.Mesh(lockerGeo, lightWoodMat);
    locker.position.set(lx, 1.05, -11.9);
    locker.castShadow = true;
    interiorGroup.add(locker);
  }

  // Reception & Information Desk in Central Lobby (0, 0.55, -15.8)
  const receptionDesk = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.8, 1.05, 1.1)),
    woodMat
  );
  receptionDesk.position.set(0, 0.52, -15.8);
  receptionDesk.castShadow = true;
  interiorGroup.add(receptionDesk);

  // Elevator Frame & Stainless Steel Doors at (-5.2, 1.8, -19.5)
  const elevatorFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.25, 3.2, 2.2)),
    darkTrimMat
  );
  elevatorFrame.position.set(-5.3, 1.6, -19.5);
  interiorGroup.add(elevatorFrame);

  // Chilled Water Fountain at (+5.1, 0.65, -19.2)
  const waterFountainMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.55, 1.25, 0.55)),
    concreteStoneMat
  );
  waterFountainMesh.position.set(5.1, 0.625, -19.2);
  interiorGroup.add(waterFountainMesh);

  // 2D. ALL FOUR INDIVIDUAL CLASSROOMS: CLASS A, CLASS B, CLASS C, CLASS D
  // 1) CLASS A (North-West Main Wing: x = -14.2, z = -16.1) — Crimson Crest
  buildClassroomFurniture(
    interiorGroup,
    -14.2,
    -16.1,
    [-18.2, -14.2, -10.2],
    [-17.2, -15.0, -12.8],
    -21.9,
    0xe11d48
  );

  // 2) CLASS B (South-West Academic Wing: x = -21.2, z = -2.5) — Sky Blue Crest
  buildClassroomFurniture(
    interiorGroup,
    -21.2,
    -2.5,
    [-23.5, -20.5],
    [-4.6, -2.2, 0.2],
    -8.4,
    0x38bdf8
  );

  // 3) CLASS C (South-East Academic Wing: x = +21.2, z = -2.5) — Amethyst Crest
  buildClassroomFurniture(
    interiorGroup,
    21.2,
    -2.5,
    [18.9, 21.9],
    [-4.6, -2.2, 0.2],
    -8.4,
    0xa855f7
  );

  // 4) CLASS D (West Academic Annex: x = -29.5, z = -16.1) — Emerald Crest
  buildClassroomFurniture(
    interiorGroup,
    -29.5,
    -16.1,
    [-32.5, -29.5, -26.5],
    [-17.2, -15.0, -12.8],
    -21.9,
    0x10b981
  );

  // 2E. MULTI-SECTION PREMIUM LIBRARY (x = 14.2, z = -16.1)
  // 3 Tall Double Bookshelf Units with Colored 3D Book Spines (Fiction, Science/Math, History/Reference)
  const shelfGeo = trackGeo(new THREE.BoxGeometry(3.6, 3.2, 0.68));
  const spineColors = [0x6366f1, 0x0ea5e9, 0x10b981, 0xf59e0b, 0xec4899, 0xd97706];
  [9.8, 14.2, 18.6].forEach((sx, sIdx) => {
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(sx, 1.6, -21.5);
    shelf.castShadow = true;
    interiorGroup.add(shelf);

    // Colored book rows on each shelf
    for (let row = 0; row < 3; row++) {
      const bookRow = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(3.1, 0.42, 0.72)),
        trackMat(
          new THREE.MeshStandardMaterial({
            color: spineColors[(sIdx * 2 + row) % spineColors.length],
            roughness: 0.55,
          })
        )
      );
      bookRow.position.set(sx, 0.9 + row * 0.85, -21.48);
      interiorGroup.add(bookRow);
    }
  });

  // Library Quiet Reading Table, Chairs & Brass Reading Lamp
  const councilTable = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.2, 0.78, 2.0)),
    woodMat
  );
  councilTable.position.set(14.2, 0.39, -15.8);
  councilTable.castShadow = true;
  interiorGroup.add(councilTable);

  const readingLamp = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.32, 0.25, 12)),
    goldAccentMat
  );
  readingLamp.position.set(14.2, 1.25, -15.8);
  interiorGroup.add(readingLamp);

  // 3D Library Reading Chairs facing the Reading Table
  const libChairSeatGeo = trackGeo(new THREE.BoxGeometry(0.64, 0.45, 0.64));
  const libChairBackGeo = trackGeo(new THREE.BoxGeometry(0.64, 0.46, 0.08));
  for (const lcx of [12.8, 14.2, 15.6]) {
    const libSeat = new THREE.Mesh(libChairSeatGeo, darkTrimMat);
    libSeat.position.set(lcx, 0.225, -14.32);
    libSeat.castShadow = true;
    interiorGroup.add(libSeat);

    const libBack = new THREE.Mesh(libChairBackGeo, woodMat);
    libBack.position.set(lcx, 0.65, -14.02);
    interiorGroup.add(libBack);
  }

  // Library Book-Return & Catalogue Counter at (8.2, 0.52, -12.6)
  const returnStation = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 1.04, 0.95)),
    lightWoodMat
  );
  returnStation.position.set(8.2, 0.52, -12.6);
  returnStation.castShadow = true;
  interiorGroup.add(returnStation);

  // Locked Archive Cabinet & Faded Project Hoshikaze Blueprint Display in East Library
  const archiveCabinet = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.1, 2.6, 2.4)),
    darkTrimMat
  );
  archiveCabinet.position.set(21.6, 1.3, -15.8);
  archiveCabinet.castShadow = true;
  interiorGroup.add(archiveCabinet);

  const archiveGoldSeal = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16)),
    goldAccentMat
  );
  archiveGoldSeal.rotation.z = Math.PI / 2;
  archiveGoldSeal.position.set(21.02, 1.55, -15.8);
  interiorGroup.add(archiveGoldSeal);

  // 2F. COMPUTER LABORATORY & TECH ANNEX (East Annex: x = +29.5, z = -16.1)
  const compKeyboardGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.03, 0.18));
  for (const compX of [27.5, 30.5, 33.5]) {
    const compDesk = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.2, 0.74, 1.05)),
      darkTrimMat
    );
    compDesk.position.set(compX, 0.37, -16.15);
    compDesk.castShadow = true;
    interiorGroup.add(compDesk);

    const monitor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.88, 0.54, 0.08)),
      screenGlowMat
    );
    monitor.position.set(compX, 1.08, -16.38);
    interiorGroup.add(monitor);

    const keyboard = new THREE.Mesh(compKeyboardGeo, concreteStoneMat);
    keyboard.position.set(compX, 0.76, -15.82);
    interiorGroup.add(keyboard);

    const chair = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.65, 0.45, 0.65)),
      woodMat
    );
    chair.position.set(compX, 0.225, -15.15);
    chair.castShadow = true;
    interiorGroup.add(chair);

    const chairBack = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.65, 0.48, 0.08)),
      darkTrimMat
    );
    chairBack.position.set(compX, 0.66, -14.85);
    interiorGroup.add(chairBack);
  }

  // Warm Interior Ceiling Lights across the Academic Complex
  const ceilingLightPositions: Array<[number, number, number]> = [
    [0, 4.2, -15.5],
    [-14.2, 4.2, -16.0],
    [14.2, 4.2, -16.0],
  ];
  for (const [lx, ly, lz] of ceilingLightPositions) {
    const panel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.6, 0.1, 1.2)),
      lanternBulbMaterial
    );
    panel.position.set(lx, 4.42, lz);
    interiorGroup.add(panel);

    const pt = new THREE.PointLight(0xfff4d6, 1.65, 22, 1.5);
    pt.position.set(lx, ly, lz);
    interiorGroup.add(pt);
  }

  // 2G. Monumental 4-Story Upper Wing of Hoshino Academy (Supported above y = 4.5m so Ground Floor is Open!)
  const upperWing = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(73.0, 9.2, 14.4)),
    facadeMaterial
  );
  upperWing.position.set(0, 4.5 + 4.6, -16.05);
  upperWing.castShadow = true;
  upperWing.receiveShadow = true;
  rootGroup.add(upperWing);

  // Exterior Architectural Balcony Railings & Glass Curtain Wall Bands on 2F & 3F
  for (const balconyY of [4.8, 9.2]) {
    const balconyLedge = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(73.8, 0.35, 1.4)),
      concreteStoneMat
    );
    balconyLedge.position.set(0, balconyY, -8.8);
    rootGroup.add(balconyLedge);

    const glassBand = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(71.5, 1.85, 0.18)),
      glassCurtainMat
    );
    glassBand.position.set(0, balconyY + 1.8, -8.82);
    rootGroup.add(glassBand);
  }

  // 4th Floor Grand Academic Penthouse Tier
  const penthouseWing = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(52, 4.8, 13.4)),
    facadeMaterial
  );
  penthouseWing.position.set(0, 13.7 + 2.4, -16.05);
  penthouseWing.castShadow = true;
  penthouseWing.receiveShadow = true;
  rootGroup.add(penthouseWing);

  // Main Wing Cornice & Grand Pitched Roof
  const mainCornice = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(74.4, 0.75, 15.2)),
    darkTrimMat
  );
  mainCornice.position.set(0, 18.7, -16.05);
  mainCornice.castShadow = true;
  rootGroup.add(mainCornice);

  const mainRoof = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(42, 5.0, 4)),
    roofMat
  );
  mainRoof.rotation.y = Math.PI / 4;
  mainRoof.scale.set(1.28, 1, 0.42);
  mainRoof.position.set(0, 21.5, -16.05);
  mainRoof.castShadow = true;
  rootGroup.add(mainRoof);

  // Central Entrance Portico & Columns (Flanking the Open Entrance Doors!)
  const porticoCanopy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(15.2, 0.85, 6.2)),
    creamWallMat
  );
  porticoCanopy.position.set(0, 4.65, -7.4);
  porticoCanopy.castShadow = true;
  porticoCanopy.receiveShadow = true;
  rootGroup.add(porticoCanopy);

  // Overhead "HOSHINO ACADEMY" Gold Plaque & Faded Star Emblem above Front Doors
  const entrancePlaque = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(7.2, 0.82, 0.28)),
    goldAccentMat
  );
  entrancePlaque.position.set(0, 4.72, -4.45);
  rootGroup.add(entrancePlaque);

  const fadedStarEmblem = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.72, 0.72, 0.22, 8)),
    goldAccentMat
  );
  fadedStarEmblem.rotation.x = Math.PI / 2;
  fadedStarEmblem.position.set(0, 5.68, -4.45);
  rootGroup.add(fadedStarEmblem);

  const columnGeo = trackGeo(new THREE.CylinderGeometry(0.42, 0.48, 4.5, 12));
  for (const cx of [-5.8, -3.3, 3.3, 5.8]) {
    const col = new THREE.Mesh(columnGeo, creamWallMat);
    col.position.set(cx, 2.25, -5.6);
    col.castShadow = true;
    col.receiveShadow = true;
    rootGroup.add(col);
  }

  // ==========================================================================
  // 3. MONUMENTAL 36M CENTRAL CLOCK TOWER & ILLUMINATED DIAL
  // ==========================================================================
  const towerShaft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(9.4, 14.5, 9.4)),
    creamWallMat
  );
  towerShaft.position.set(0, 24.8, -15.5);
  towerShaft.castShadow = true;
  towerShaft.receiveShadow = true;
  rootGroup.add(towerShaft);

  const towerTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.2, 0.75, 10.2)),
    darkTrimMat
  );
  towerTrim.position.set(0, 32.2, -15.5);
  rootGroup.add(towerTrim);

  const towerSpire = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(7.8, 7.2, 4)),
    roofMat
  );
  towerSpire.rotation.y = Math.PI / 4;
  towerSpire.position.set(0, 36.1, -15.5);
  towerSpire.castShadow = true;
  rootGroup.add(towerSpire);

  const clockRim = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.65, 2.65, 0.32, 24)),
    goldAccentMat
  );
  clockRim.rotation.x = Math.PI / 2;
  clockRim.position.set(0, 27.2, -10.75);
  rootGroup.add(clockRim);

  const clockFace = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.35, 2.35, 0.36, 24)),
    lanternBulbMaterial
  );
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(0, 27.2, -10.72);
  rootGroup.add(clockFace);

  const clockHourHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.2, 1.35, 0.12)),
    darkTrimMat
  );
  clockHourHand.position.set(0, 27.2, -10.5);
  clockHourHand.rotation.z = -Math.PI / 3;
  rootGroup.add(clockHourHand);

  const clockMinuteHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 1.9, 0.12)),
    darkTrimMat
  );
  clockMinuteHand.position.set(0, 27.2, -10.48);
  clockMinuteHand.rotation.z = Math.PI / 6;
  rootGroup.add(clockMinuteHand);

  // ==========================================================================
  // 4. WALKABLE CLASS B & CLASS C SIDE WINGS + GYMNASIUM, CAFETERIA & DORMITORY
  // ==========================================================================
  const sideUpperGeo = trackGeo(new THREE.BoxGeometry(12.6, 9.2, 14.4));
  const sideRoofGeo = trackGeo(new THREE.ConeGeometry(11.6, 3.6, 4));

  for (const wx of [-21.2, 21.2]) {
    // Upper stories above y = 4.5 so ground floor Class B & Class C are walkable!
    const upperSide = new THREE.Mesh(sideUpperGeo, facadeMaterial);
    upperSide.position.set(wx, 4.5 + 4.6, -2.5);
    upperSide.castShadow = true;
    upperSide.receiveShadow = true;
    rootGroup.add(upperSide);

    // Outer ground-floor wall of side wing
    const outerX = wx < 0 ? wx - 6.0 : wx + 6.0;
    const outerSideWall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.4, 4.5, 14.0)),
      facadeMaterial
    );
    outerSideWall.position.set(outerX, 2.25, -2.5);
    outerSideWall.castShadow = true;
    rootGroup.add(outerSideWall);

    // South ground-floor window wall of side wing
    const southSideWall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(12.4, 4.5, 0.4)),
      facadeMaterial
    );
    southSideWall.position.set(wx, 2.25, 4.4);
    southSideWall.castShadow = true;
    rootGroup.add(southSideWall);

    const sRoof = new THREE.Mesh(sideRoofGeo, roofMat);
    sRoof.rotation.y = Math.PI / 4;
    sRoof.scale.set(0.84, 1, 1.18);
    sRoof.position.set(wx, 15.5, -2.5);
    sRoof.castShadow = true;
    rootGroup.add(sRoof);
  }

  // Grand East Gymnasium & Sports Arena (x: 38.5, z: 8, 16m x 11.6m x 22m)
  const gymBuilding = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.0, 11.6, 22.0)),
    creamWallMat
  );
  gymBuilding.position.set(38.5, 5.8, 8.0);
  gymBuilding.castShadow = true;
  gymBuilding.receiveShadow = true;
  rootGroup.add(gymBuilding);

  const gymGlassBand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.25, 4.2, 18.0)),
    glassCurtainMat
  );
  gymGlassBand.position.set(30.4, 6.5, 8.0);
  rootGroup.add(gymGlassBand);

  // Spectator Bench outside Gym Entrance (x = 29.5, z = 8.0)
  const gymBench = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.85, 0.52, 4.2)),
    woodMat
  );
  gymBench.position.set(29.5, 0.26, 8.0);
  gymBench.castShadow = true;
  rootGroup.add(gymBench);

  const gymRoof = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(14.8, 4.2, 4)),
    roofMat
  );
  gymRoof.rotation.y = Math.PI / 4;
  gymRoof.scale.set(0.88, 1, 1.28);
  gymRoof.position.set(38.5, 13.7, 8.0);
  gymRoof.castShadow = true;
  rootGroup.add(gymRoof);

  // Grand West Student Cafeteria & Club Pavilion (x: -38.8, z: 8, 15.6m x 9.8m x 19m)
  const cafeBuilding = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(15.6, 9.8, 19.0)),
    facadeMaterial
  );
  cafeBuilding.position.set(-38.8, 4.9, 8.0);
  cafeBuilding.castShadow = true;
  cafeBuilding.receiveShadow = true;
  rootGroup.add(cafeBuilding);

  // Cafeteria Food Counter & Menu Board on East Terrace (-30.4, z = 8.0)
  const cafeCounter = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.1, 1.1, 4.8)),
    lightWoodMat
  );
  cafeCounter.position.set(-30.4, 0.55, 8.0);
  cafeCounter.castShadow = true;
  rootGroup.add(cafeCounter);

  const cafeMenuBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.2, 1.2, 3.6)),
    screenGlowMat
  );
  cafeMenuBoard.position.set(-30.8, 2.8, 8.0);
  rootGroup.add(cafeMenuBoard);

  const cafeRoof = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.8, 0.75, 20.2)),
    darkTrimMat
  );
  cafeRoof.position.set(-38.8, 10.1, 8.0);
  rootGroup.add(cafeRoof);

  // 4-Story Hoshino Student Dormitory Hall (x: -45.0, z: -34.5, 18.5m x 15.2m x 18.5m)
  const dormitoryBuilding = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(18.5, 15.2, 18.5)),
    facadeMaterial
  );
  dormitoryBuilding.position.set(-45.0, 7.6, -34.5);
  dormitoryBuilding.castShadow = true;
  dormitoryBuilding.receiveShadow = true;
  rootGroup.add(dormitoryBuilding);

  // Dormitory Lounge Bench & Drink Vending Machine at (-35.0, z = -34.5 / -28.0)
  const dormVending = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.95, 2.1, 1.25)),
    screenGlowMat
  );
  dormVending.position.set(-35.1, 1.05, -28.0);
  dormVending.castShadow = true;
  rootGroup.add(dormVending);

  const dormLoungeSeat = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.1, 0.55, 2.8)),
    woodMat
  );
  dormLoungeSeat.position.set(-35.0, 0.28, -34.5);
  dormLoungeSeat.castShadow = true;
  rootGroup.add(dormLoungeSeat);

  const dormitoryRoof = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(15.2, 4.2, 4)),
    roofMat
  );
  dormitoryRoof.rotation.y = Math.PI / 4;
  dormitoryRoof.position.set(-45.0, 17.3, -34.5);
  dormitoryRoof.castShadow = true;
  rootGroup.add(dormitoryRoof);

  // ==========================================================================
  // 5. NORTH ATHLETIC RUNNING TRACK & SOCCER FIELD (Behind the Main Wing!)
  // ==========================================================================
  const northTrackSurface = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(56, 0.12, 22)),
    trackClayMat
  );
  northTrackSurface.position.set(0, 0.02, -35.0);
  northTrackSurface.receiveShadow = true;
  rootGroup.add(northTrackSurface);

  const soccerInfield = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(40, 0.15, 13)),
    grassMat
  );
  soccerInfield.position.set(0, 0.035, -35.0);
  soccerInfield.receiveShadow = true;
  rootGroup.add(soccerInfield);

  const goalPostMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  );
  for (const gx of [-19.5, 19.5]) {
    const crossbar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.18, 0.18, 4.2)),
      goalPostMat
    );
    crossbar.position.set(gx, 2.2, -35.0);
    rootGroup.add(crossbar);

    for (const gzOff of [-2.0, 2.0]) {
      const post = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8)),
        goalPostMat
      );
      post.position.set(gx, 1.1, -35.0 + gzOff);
      rootGroup.add(post);
    }
  }

  // ==========================================================================
  // 6. COURTYARD OCTAGONAL FOUNTAIN & SITTABLE BENCHES
  // ==========================================================================
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(0, 0.1, 10);
  rootGroup.add(fountainGroup);

  const basinOuter = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(4.6, 4.8, 0.85, 8)),
    stoneMat
  );
  basinOuter.position.y = 0.42;
  basinOuter.castShadow = true;
  basinOuter.receiveShadow = true;
  fountainGroup.add(basinOuter);

  const fountainWaterRing = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(4.1, 4.1, 0.68, 16)),
    waterMat
  );
  fountainWaterRing.position.y = 0.45;
  fountainGroup.add(fountainWaterRing);

  const centerPedestal = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.85, 1.15, 2.4, 8)),
    stoneMat
  );
  centerPedestal.position.y = 1.2;
  centerPedestal.castShadow = true;
  fountainGroup.add(centerPedestal);

  const upperBowl = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.1, 0.9, 0.55, 12)),
    stoneMat
  );
  upperBowl.position.y = 2.25;
  upperBowl.castShadow = true;
  fountainGroup.add(upperBowl);

  const spireFinial = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.45, 1.3, 8)),
    goldAccentMat
  );
  spireFinial.position.y = 3.1;
  fountainGroup.add(spireFinial);

  const benchSeatGeo = trackGeo(new THREE.BoxGeometry(3.2, 0.15, 0.75));
  const benchBackGeo = trackGeo(new THREE.BoxGeometry(3.2, 0.45, 0.12));
  const benchLegGeo = trackGeo(new THREE.BoxGeometry(0.2, 0.5, 0.7));
  const benchPositions: Array<{ x: number; z: number; rotY: number }> = [
    { x: -6.5, z: 10, rotY: Math.PI / 2 },
    { x: 6.5, z: 10, rotY: -Math.PI / 2 },
    { x: 0, z: 3.5, rotY: 0 },
    { x: 0, z: 16.5, rotY: Math.PI },
  ];

  for (const bp of benchPositions) {
    const bGroup = new THREE.Group();
    bGroup.position.set(bp.x, 0.1, bp.z);
    bGroup.rotation.y = bp.rotY;

    const seat = new THREE.Mesh(benchSeatGeo, woodMat);
    seat.position.y = 0.5;
    seat.castShadow = true;
    seat.receiveShadow = true;
    bGroup.add(seat);

    const backrest = new THREE.Mesh(benchBackGeo, lightWoodMat);
    backrest.position.set(0, 0.78, -0.32);
    bGroup.add(backrest);

    for (const lx of [-1.2, 1.2]) {
      const leg = new THREE.Mesh(benchLegGeo, darkTrimMat);
      leg.position.set(lx, 0.25, 0);
      leg.castShadow = true;
      bGroup.add(leg);
    }

    rootGroup.add(bGroup);
  }

  // ==========================================================================
  // 7. MAIN ENTRANCE GATE, SECURITY BOOTH & CAMPUS MAP BOARD (z = 35)
  // ==========================================================================
  const gatePillarGeo = trackGeo(new THREE.BoxGeometry(2.0, 5.2, 2.0));
  const gateCapGeo = trackGeo(new THREE.BoxGeometry(2.4, 0.5, 2.4));
  for (const gx of [-4.8, 4.8]) {
    const pillar = new THREE.Mesh(gatePillarGeo, stoneMat);
    pillar.position.set(gx, 2.6, 35);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    rootGroup.add(pillar);

    const cap = new THREE.Mesh(gateCapGeo, darkTrimMat);
    cap.position.set(gx, 5.35, 35);
    rootGroup.add(cap);
  }

  // Overhead Architectural Entrance Arch Beam & Gold Academy Sign
  const gateArchBeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(12.2, 0.75, 1.4)),
    darkTrimMat
  );
  gateArchBeam.position.set(0, 5.65, 35);
  gateArchBeam.castShadow = true;
  rootGroup.add(gateArchBeam);

  const gateGoldSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(6.4, 0.52, 1.5)),
    goldAccentMat
  );
  gateGoldSign.position.set(0, 5.68, 35);
  rootGroup.add(gateGoldSign);

  // Security & Reception Booth at (-6.8, z = 33.4)
  const securityBooth = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.6, 2.8, 2.4)),
    creamWallMat
  );
  securityBooth.position.set(-7.2, 1.4, 33.2);
  securityBooth.castShadow = true;
  rootGroup.add(securityBooth);

  const securityWindow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.7, 1.1, 1.8)),
    glassCurtainMat
  );
  securityWindow.position.set(-7.2, 1.7, 33.2);
  rootGroup.add(securityWindow);

  // Interactive Campus Map Board at (+6.4, z = 33.4)
  const mapBoardStand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 2.1, 0.25)),
    darkTrimMat
  );
  mapBoardStand.position.set(6.4, 1.15, 33.4);
  mapBoardStand.castShadow = true;
  rootGroup.add(mapBoardStand);

  const mapScreen = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.9, 1.25, 0.3)),
    screenGlowMat
  );
  mapScreen.position.set(6.4, 1.35, 33.4);
  rootGroup.add(mapScreen);

  const perimeterWallGeo = trackGeo(new THREE.BoxGeometry(26, 2.2, 0.7));
  for (const wx of [-18.5, 18.5]) {
    const wall = new THREE.Mesh(perimeterWallGeo, creamWallMat);
    wall.position.set(wx, 1.1, 35);
    wall.castShadow = true;
    wall.receiveShadow = true;
    rootGroup.add(wall);
  }

  // ==========================================================================
  // 8. SAKURA TREES, LANTERN LAMPPOSTS & CAFETERIA OUTDOOR TABLES
  // ==========================================================================
  const treeCoords: Array<[number, number, number]> = [
    [-11.5, 4, 1.05],
    [11.5, 4, 1.0],
    [-11.5, 13, 1.12],
    [11.5, 13, 1.08],
    [-11.5, 22, 0.96],
    [11.5, 22, 1.04],
    [-11.5, 30, 0.92],
    [11.5, 30, 0.95],
    [-21.5, 26, 1.15],
    [21.5, 26, 1.1],
    [-11.5, 46, 1.08],
    [11.5, 46, 1.06],
    [-11.5, 76, 1.12],
    [11.5, 76, 1.1],
    [-50.0, 20, 1.18],
    [-50.0, -4, 1.1],
    [50.0, 20, 1.15],
    [50.0, -4, 1.08],
    [-8.5, -56, 1.1],
    [8.5, -56, 1.1],
    [-8.5, -74, 1.16],
    [8.5, -74, 1.16],
  ];

  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.46, 3.6, 8));
  const canopyGeo = trackGeo(new THREE.IcosahedronGeometry(2.65, 1));

  for (const [tx, tz, scale] of treeCoords) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, tz);
    treeGroup.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, woodMat);
    trunk.position.y = 1.8;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const puffs: Array<[number, number, number, number]> = [
      [0, 4.2, 0, 1.0],
      [-1.3, 3.7, 0.8, 0.78],
      [1.2, 3.8, -0.7, 0.82],
      [0.4, 4.9, 0.9, 0.72],
    ];
    for (const [px, py, pz, ps] of puffs) {
      const puff = new THREE.Mesh(canopyGeo, sakuraFoliageMat);
      puff.position.set(px, py, pz);
      puff.scale.setScalar(ps);
      puff.castShadow = true;
      puff.receiveShadow = true;
      treeGroup.add(puff);
    }

    rootGroup.add(treeGroup);
  }

  // Outdoor Cafeteria & Town Cafe Dining Tables with Individual Chairs & Parasols
  const cafeTablePositions: Array<[number, number]> = [
    [-27.5, 3.8],
    [-27.5, 12.2],
    [-14.5, 58.0],
    [-14.5, 66.0],
  ];
  const roundTableGeo = trackGeo(new THREE.CylinderGeometry(1.15, 1.15, 0.12, 12));
  const tablePedestalGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.24, 0.78, 8));
  const parasolConeGeo = trackGeo(new THREE.ConeGeometry(1.65, 0.65, 10));
  const cafeChairGeo = trackGeo(new THREE.BoxGeometry(0.52, 0.46, 0.52));

  for (const [ctx, ctz] of cafeTablePositions) {
    const ped = new THREE.Mesh(tablePedestalGeo, darkTrimMat);
    ped.position.set(ctx, 0.39, ctz);
    rootGroup.add(ped);

    const top = new THREE.Mesh(roundTableGeo, lightWoodMat);
    top.position.set(ctx, 0.78, ctz);
    top.castShadow = true;
    rootGroup.add(top);

    const pole = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6)),
      darkTrimMat
    );
    pole.position.set(ctx, 1.15, ctz);
    rootGroup.add(pole);

    const umbrella = new THREE.Mesh(parasolConeGeo, crimsonMat);
    umbrella.position.set(ctx, 2.35, ctz);
    umbrella.castShadow = true;
    rootGroup.add(umbrella);

    // Individual dining chairs around each table
    for (const [chX, chZ] of [
      [1.3, 0],
      [-1.3, 0],
      [0, 1.3],
      [0, -1.3],
    ]) {
      const ch = new THREE.Mesh(cafeChairGeo, woodMat);
      ch.position.set(ctx + chX, 0.23, ctz + chZ);
      ch.castShadow = true;
      rootGroup.add(ch);
    }
  }

  const lanternCoords: Array<[number, number]> = [
    [-8.2, 8],
    [8.2, 8],
    [-8.2, 18],
    [8.2, 18],
    [-6.0, 29],
    [6.0, 29],
    [-7.5, 52],
    [7.5, 52],
    [-7.5, 72],
    [7.5, 72],
  ];
  const poleGeo = trackGeo(new THREE.CylinderGeometry(0.1, 0.14, 4.0, 8));
  const bulbGeo = trackGeo(new THREE.SphereGeometry(0.32, 12, 12));
  const lanternPointLights: THREE.PointLight[] = [];

  lanternCoords.forEach(([lx, lz], idx) => {
    const pole = new THREE.Mesh(poleGeo, darkTrimMat);
    pole.position.set(lx, 2.0, lz);
    pole.castShadow = true;
    rootGroup.add(pole);

    const bulb = new THREE.Mesh(bulbGeo, lanternBulbMaterial);
    bulb.position.set(lx, 4.15, lz);
    rootGroup.add(bulb);

    if (idx < 2) {
      const pt = new THREE.PointLight(0xffb85c, 1.4, 22, 1.8);
      pt.position.set(lx, 4.0, lz);
      rootGroup.add(pt);
      lanternPointLights.push(pt);
    }
  });

  // ==========================================================================
  // 8B. SURROUNDING OPEN WORLD DISTRICTS:
  //  - SOUTH: COMMERCIAL, RESIDENTIAL & ELECTRIC RAILWAY STATION (z = 42..102)
  //  - EAST:  AQUATICS 25M SWIMMING POOL, SCIENCE LAB & OBSERVATORY DOME (x = 50..82)
  //  - WEST:  JAPANESE KOI POND, VERMILION BRIDGE & AUDITORIUM STAGE (x = -50..-82)
  //  - NORTH: HILLTOP TORII SHRINE & BASKETBALL COURTS (z = -48..-92)
  // ==========================================================================
  const stripeGeo = trackGeo(new THREE.BoxGeometry(2.2, 0.04, 0.65));
  const whitePaintMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
  );
  for (let sz = 41.0; sz <= 45.0; sz += 1.2) {
    for (const sx of [-4.5, -1.5, 1.5, 4.5]) {
      const stripe = new THREE.Mesh(stripeGeo, whitePaintMat);
      stripe.position.set(sx, 0.11, sz);
      rootGroup.add(stripe);
    }
  }

  // Multi-Story West Town Building: Hoshino Manga, Books & Ramen Cafe (x = -26, z = 62)
  const westTownShop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.5, 13.5, 20.5)),
    facadeMaterial
  );
  westTownShop.position.set(-26.0, 6.75, 62.0);
  westTownShop.castShadow = true;
  westTownShop.receiveShadow = true;
  rootGroup.add(westTownShop);

  const westShopAwning = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.6, 0.55, 18.5)),
    crimsonMat
  );
  westShopAwning.position.set(-16.8, 3.5, 62.0);
  rootGroup.add(westShopAwning);

  // Multi-Story East Town Building: Hoshino Town Plaza, Apartments & Konbini Mart (x = +26, z = 62)
  const eastTownShop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.5, 13.5, 20.5)),
    facadeMaterial
  );
  eastTownShop.position.set(26.0, 6.75, 62.0);
  eastTownShop.castShadow = true;
  eastTownShop.receiveShadow = true;
  rootGroup.add(eastTownShop);

  const eastShopSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 0.85, 18.5)),
    screenGlowMat
  );
  eastShopSign.position.set(17.0, 3.6, 62.0);
  rootGroup.add(eastShopSign);

  // Hoshino Electric Railway Station Terminal Platform, Bench & Grand Canopy (x = 0, z = 94.5)
  const stationPlatform = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(62.0, 0.85, 8.2)),
    stoneMat
  );
  stationPlatform.position.set(0, 0.425, 94.5);
  stationPlatform.receiveShadow = true;
  rootGroup.add(stationPlatform);

  const stationBench = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.4, 0.52, 0.85)),
    woodMat
  );
  stationBench.position.set(-8.0, 1.05, 93.2);
  rootGroup.add(stationBench);

  const stationCanopy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(58.0, 0.65, 8.0)),
    darkTrimMat
  );
  stationCanopy.position.set(0, 6.2, 94.5);
  stationCanopy.castShadow = true;
  rootGroup.add(stationCanopy);

  const stationSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(12.5, 1.15, 0.4)),
    goldAccentMat
  );
  stationSign.position.set(0, 6.75, 90.6);
  rootGroup.add(stationSign);

  for (const spx of [-24, -12, 0, 12, 24]) {
    const sCol = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 5.6, 8)),
      darkTrimMat
    );
    sCol.position.set(spx, 3.2, 94.5);
    rootGroup.add(sCol);
  }

  // 4-Car Hoshino Express Commuter Train at Station (z = 100.5)
  const trainBodyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.25,
    })
  );
  for (const carX of [-21.0, -7.0, 7.0, 21.0]) {
    const carBody = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(13.2, 3.6, 3.2)),
      trainBodyMat
    );
    carBody.position.set(carX, 2.2, 100.5);
    carBody.castShadow = true;
    rootGroup.add(carBody);

    const carStripe = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(13.3, 0.48, 3.26)),
      screenGlowMat
    );
    carStripe.position.set(carX, 1.9, 100.5);
    rootGroup.add(carStripe);

    const carWindows = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(11.8, 1.0, 3.28)),
      lanternBulbMaterial
    );
    carWindows.position.set(carX, 2.65, 100.5);
    rootGroup.add(carWindows);
  }

  // --- EAST DISTRICT: Hoshino 25m Aquatics Swimming Pool, Science Lab Bench & Research Dome ---
  const poolDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(28.0, 0.14, 30.0)),
    hallwayTileMat
  );
  poolDeck.position.set(66.0, 0.03, 8.0);
  poolDeck.receiveShadow = true;
  rootGroup.add(poolDeck);

  const poolWater = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.0, 0.18, 22.0)),
    waterMat
  );
  poolWater.position.set(66.0, 0.06, 8.0);
  rootGroup.add(poolWater);

  const blockGeo = trackGeo(new THREE.BoxGeometry(0.8, 0.65, 0.8));
  for (const pbx of [60.5, 64.2, 67.8, 71.5]) {
    const sBlock = new THREE.Mesh(blockGeo, stoneMat);
    sBlock.position.set(pbx, 0.4, 19.6);
    sBlock.castShadow = true;
    rootGroup.add(sBlock);
  }

  // Science Lab Outdoor/Annex Microscope Bench at (52.5, z = -22.0) beside the Research Dome
  const sciLabBench = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.2, 0.88, 1.2)),
    concreteStoneMat
  );
  sciLabBench.position.set(52.5, 0.44, -22.0);
  sciLabBench.castShadow = true;
  rootGroup.add(sciLabBench);

  const microscopeBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.14, 0.22, 0.48, 12)),
    goldAccentMat
  );
  microscopeBody.position.set(52.5, 1.12, -22.0);
  rootGroup.add(microscopeBody);

  // Northeast Hoshino Research Centre & Astronomy Observatory Rotunda + Silver Dome (x = 66, z = -26)
  const obsCylinder = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(10.2, 10.5, 10.5, 24)),
    creamWallMat
  );
  obsCylinder.position.set(66.0, 5.25, -26.0);
  obsCylinder.castShadow = true;
  obsCylinder.receiveShadow = true;
  rootGroup.add(obsCylinder);

  const silverDomeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.25,
      metalness: 0.75,
    })
  );
  const obsDome = new THREE.Mesh(
    trackGeo(
      new THREE.SphereGeometry(10.2, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2)
    ),
    silverDomeMat
  );
  obsDome.position.set(66.0, 10.5, -26.0);
  obsDome.castShadow = true;
  rootGroup.add(obsDome);

  // --- WEST DISTRICT: Japanese Koi Pond, Vermilion Bridge & Auditorium Stage ---
  const koiPondWater = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(18.0, 0.14, 24.0)),
    waterMat
  );
  koiPondWater.position.set(-66.0, 0.04, 8.0);
  rootGroup.add(koiPondWater);

  const bridgeDeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(20.0, 0.28, 3.8)),
    crimsonMat
  );
  bridgeDeck.position.set(-66.0, 0.16, 8.0);
  bridgeDeck.receiveShadow = true;
  rootGroup.add(bridgeDeck);

  for (const railZ of [6.1, 9.9]) {
    const bridgeRail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(20.0, 0.85, 0.22)),
      crimsonMat
    );
    bridgeRail.position.set(-66.0, 0.6, railZ);
    bridgeRail.castShadow = true;
    rootGroup.add(bridgeRail);
  }

  // Northwest Auditorium & Festival Stage + Audience Seating Rows (x = -66, z = -26)
  const concertStage = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.0, 1.1, 9.2)),
    woodMat
  );
  concertStage.position.set(-66.0, 0.55, -26.0);
  concertStage.castShadow = true;
  concertStage.receiveShadow = true;
  rootGroup.add(concertStage);

  const stageBackdrop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(15.6, 6.8, 0.6)),
    crimsonMat
  );
  stageBackdrop.position.set(-66.0, 4.2, -29.8);
  stageBackdrop.castShadow = true;
  rootGroup.add(stageBackdrop);

  // Auditorium Audience Seating Rows at (-66.0, z = -18.5 & -16.2)
  for (const rowZ of [-18.5, -16.2]) {
    const audRow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(10.0, 0.48, 0.85)),
      woodMat
    );
    audRow.position.set(-66.0, 0.24, rowZ);
    audRow.castShadow = true;
    rootGroup.add(audRow);
  }

  // --- NORTH DISTRICT: Mountain Crimson Torii Shrine & Outdoor Basketball Courts ---
  const toriiPillarGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.34, 5.6, 10));
  const toriiTopBeamGeo = trackGeo(new THREE.BoxGeometry(7.8, 0.45, 0.55));
  const toriiSubBeamGeo = trackGeo(new THREE.BoxGeometry(6.4, 0.32, 0.4));

  for (const tz of [-52, -62, -72, -82]) {
    for (const tx of [-2.8, 2.8]) {
      const tCol = new THREE.Mesh(toriiPillarGeo, crimsonMat);
      tCol.position.set(tx, 2.8, tz);
      tCol.castShadow = true;
      rootGroup.add(tCol);
    }
    const topBeam = new THREE.Mesh(toriiTopBeamGeo, crimsonMat);
    topBeam.position.set(0, 5.5, tz);
    topBeam.castShadow = true;
    rootGroup.add(topBeam);

    const subBeam = new THREE.Mesh(toriiSubBeamGeo, crimsonMat);
    subBeam.position.set(0, 4.5, tz);
    rootGroup.add(subBeam);
  }

  const shrineHall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(18.5, 8.8, 10.0)),
    creamWallMat
  );
  shrineHall.position.set(0, 4.4, -90.2);
  shrineHall.castShadow = true;
  shrineHall.receiveShadow = true;
  rootGroup.add(shrineHall);

  const shrineRoof = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(15.2, 4.8, 4)),
    crimsonMat
  );
  shrineRoof.rotation.y = Math.PI / 4;
  shrineRoof.scale.set(1.16, 1, 0.85);
  shrineRoof.position.set(0, 11.1, -90.2);
  shrineRoof.castShadow = true;
  rootGroup.add(shrineRoof);

  for (const bkx of [-24.0, 24.0]) {
    const bCourt = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(16.0, 0.12, 24.0)),
      trackClayMat
    );
    bCourt.position.set(bkx, 0.025, -60.0);
    bCourt.receiveShadow = true;
    rootGroup.add(bCourt);
  }

  // ==========================================================================
  // 9. DISTANT CITY SKYLINE SILHOUETTES
  // ==========================================================================
  const backdropMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x161f38,
      roughness: 0.95,
      metalness: 0.05,
    })
  );
  const backdropPositions: Array<[number, number, number, number, number]> = [
    [-115, -118, 26, 36, 18],
    [-68, -125, 28, 44, 18],
    [68, -125, 26, 40, 18],
    [115, -118, 24, 34, 18],
  ];
  for (const [bx, bz, bw, bh, bd] of backdropPositions) {
    const bMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(bw, bh, bd)),
      backdropMat
    );
    bMesh.position.set(bx, bh / 2, bz);
    rootGroup.add(bMesh);
  }

  // ==========================================================================
  // 10. INSTANCED SAKURA PETAL STREAM
  // ==========================================================================
  const maxPetals = 150;
  const petalGeo = trackGeo(new THREE.PlaneGeometry(0.22, 0.14));
  const petalMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xffd1dc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    })
  );
  const petalInstancedMesh = new THREE.InstancedMesh(petalGeo, petalMat, maxPetals);
  petalInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rootGroup.add(petalInstancedMesh);

  const petalData: AcademyEnvironmentRefs['petalData'] = [];
  const dummyPetal = new THREE.Object3D();

  for (let i = 0; i < maxPetals; i++) {
    const item = {
      x: (((i * 73) % 100) / 100 - 0.5) * 44,
      y: 1 + (((i * 37) % 100) / 100) * 11,
      z: -6 + (((i * 53) % 100) / 100) * 42,
      vx: -0.45 - (i % 7) * 0.08,
      vy: -0.55 - (i % 5) * 0.09,
      vz: 0.25 + (i % 6) * 0.06,
      rx: (i * 0.7) % Math.PI,
      ry: (i * 1.3) % Math.PI,
      scale: 0.75 + (i % 5) * 0.12,
    };
    petalData.push(item);

    dummyPetal.position.set(item.x, item.y, item.z);
    dummyPetal.rotation.set(item.rx, item.ry, 0);
    dummyPetal.scale.setScalar(item.scale);
    dummyPetal.updateMatrix();
    petalInstancedMesh.setMatrixAt(i, dummyPetal.matrix);
  }
  petalInstancedMesh.instanceMatrix.needsUpdate = true;

  // ==========================================================================
  // 11. REALISTIC WORLD ENHANCEMENTS & VOLUMETRIC SKY WEATHER CLOUDS
  // ==========================================================================
  const hedgeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1f5233,
      roughness: 0.86,
      metalness: 0.02,
    })
  );
  const hedgeGeo = trackGeo(new THREE.BoxGeometry(1.1, 0.85, 6.8));
  for (const hx of [-9.6, 9.6]) {
    for (const hz of [0.5, 19.5, 28.5]) {
      const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
      hedge.position.set(hx, 0.45, hz);
      hedge.castShadow = true;
      hedge.receiveShadow = true;
      rootGroup.add(hedge);
    }
  }

  // Wooden Pergola Beams above West Cafeteria Outdoor Terrace (x = -28, z = 8)
  const pergolaBeamGeo = trackGeo(new THREE.BoxGeometry(6.8, 0.22, 0.28));
  for (let pz = 2.0; pz <= 14.0; pz += 2.4) {
    const beam = new THREE.Mesh(pergolaBeamGeo, woodMat);
    beam.position.set(-28.2, 3.85, pz);
    beam.castShadow = true;
    rootGroup.add(beam);
  }

  // Railway Tracks & Wooden Sleepers under the Hoshino Commuter Train (z = 100.5)
  const railGeo = trackGeo(new THREE.BoxGeometry(96.0, 0.12, 0.14));
  for (const rz of [99.7, 101.3]) {
    const rail = new THREE.Mesh(railGeo, silverDomeMat);
    rail.position.set(0, 0.1, rz);
    rootGroup.add(rail);
  }
  const sleeperGeo = trackGeo(new THREE.BoxGeometry(0.45, 0.08, 2.4));
  for (let sx = -44; sx <= 44; sx += 2.2) {
    const sleeper = new THREE.Mesh(sleeperGeo, woodMat);
    sleeper.position.set(sx, 0.05, 100.5);
    rootGroup.add(sleeper);
  }

  // Dynamic Volumetric 3D Sky Cloud Clusters & Celestial Sun/Moon Orb
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'SkyWeatherClouds';
  rootGroup.add(cloudGroup);

  const cloudMaterial = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe2e8f0,
      emissiveIntensity: 0.22,
      roughness: 0.92,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9,
    })
  );

  const cloudPuffGeo = trackGeo(new THREE.IcosahedronGeometry(3.8, 1));
  const cloudClusterCoords: Array<[number, number, number, number]> = [
    [-115, 44, -68, 1.35],
    [-75, 48, -42, 1.15],
    [-32, 43, -55, 1.25],
    [18, 46, -62, 1.4],
    [68, 45, -38, 1.2],
    [112, 49, -58, 1.3],
    [-98, 42, 5, 1.18],
    [-46, 47, 14, 1.05],
    [12, 45, 8, 1.22],
    [58, 43, 18, 1.15],
    [105, 46, -4, 1.28],
    [-110, 48, 56, 1.32],
    [-54, 44, 66, 1.12],
    [-6, 49, 52, 1.26],
    [48, 45, 68, 1.18],
    [96, 47, 54, 1.24],
    [-28, 52, -95, 1.45],
    [42, 51, -92, 1.38],
  ];

  const cloudSubPuffs: Array<[number, number, number, number, number, number]> = [
    [0, 0, 0, 1.35, 0.62, 1.0],
    [-3.4, -0.3, 0.8, 1.05, 0.52, 0.85],
    [3.6, -0.2, -0.6, 1.1, 0.55, 0.88],
    [0.8, 0.9, 1.4, 0.92, 0.58, 0.82],
    [-1.6, 0.7, -1.5, 0.88, 0.5, 0.78],
  ];

  cloudClusterCoords.forEach(([cx, cy, cz, cScale], idx) => {
    const cluster = new THREE.Group();
    cluster.position.set(cx, cy, cz);
    cluster.scale.setScalar(cScale);
    cluster.userData = {
      driftSpeed: 1.15 + (idx % 5) * 0.32,
      baseY: cy,
      bobPhase: idx * 0.85,
    };

    for (const [px, py, pz, sx, sy, sz] of cloudSubPuffs) {
      const puff = new THREE.Mesh(cloudPuffGeo, cloudMaterial);
      puff.position.set(px, py, pz);
      puff.scale.set(sx, sy, sz);
      cluster.add(puff);
    }

    cloudGroup.add(cluster);
  });

  const celestialDiscMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    })
  );
  const celestialDisc = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(6.5, 20, 20)),
    celestialDiscMat
  );
  celestialDisc.position.set(42, 68, -95);
  rootGroup.add(celestialDisc);

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return {
    rootGroup,
    facadeMaterial,
    lanternBulbMaterial,
    lanternPointLights,
    petalInstancedMesh,
    petalData,
    clockHourHand,
    clockMinuteHand,
    fountainWaterRing,
    cloudGroup,
    cloudMaterial,
    celestialDisc,
    doorPivots,
    dispose,
  };
}
