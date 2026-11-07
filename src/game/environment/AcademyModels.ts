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
  dispose: () => void;
}

export function buildAcademyEnvironment(
  textures: ProceduralTextureSet
): AcademyEnvironmentRefs {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'SeiranAcademyEnvironment';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // Shared PBR Materials
  const courtyardMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.courtyardTileColor,
      bumpMap: textures.courtyardTileBump,
      bumpScale: 0.03,
      roughness: 0.78,
      metalness: 0.05,
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
      roughness: 0.65,
      metalness: 0.12,
    })
  );

  const roofMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.roofSlateColor,
      bumpMap: textures.roofSlateBump,
      bumpScale: 0.04,
      roughness: 0.55,
      metalness: 0.22,
    })
  );

  const creamWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe2dfd7,
      roughness: 0.72,
      metalness: 0.05,
    })
  );

  const interiorWallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.75,
      metalness: 0.04,
    })
  );

  const interiorFloorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc8a97e,
      roughness: 0.45,
      metalness: 0.08,
    })
  );

  const hallwayTileMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd6d3cd,
      roughness: 0.4,
      metalness: 0.1,
    })
  );

  const darkTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e2638,
      roughness: 0.5,
      metalness: 0.35,
    })
  );

  const stoneMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x949ba6,
      roughness: 0.8,
      metalness: 0.08,
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
      roughness: 0.82,
      metalness: 0.04,
    })
  );

  const lightWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xa47551,
      roughness: 0.65,
      metalness: 0.06,
    })
  );

  const chalkboardMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x14452f,
      roughness: 0.7,
      metalness: 0.05,
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
      roughness: 0.3,
      metalness: 0.8,
    })
  );

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
    trackGeo(new THREE.BoxGeometry(66, 0.14, 54)),
    courtyardMat
  );
  courtyardPlaza.position.set(0, 0.02, 10);
  courtyardPlaza.receiveShadow = true;
  rootGroup.add(courtyardPlaza);

  // Extended East-West Grand Promenade connecting West Koi Garden (-86) to East Research & Pool (+86)
  const crossWalkway = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(188, 0.15, 8.2)),
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
  // 2. WALKABLE MAIN ACADEMIC BUILDING (Ground Floor Interior + Upper Stories)
  // ==========================================================================
  // Ground Floor Interior spans x: -22.8..22.8, z: -9.8..-22.4, y: 0..4.5
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'WalkableSchoolInterior';
  rootGroup.add(interiorGroup);

  // 2A. School Interior Floor (Polished Hallway + Wood Classroom & Library Floors)
  const classroomFloorWest = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(17.2, 0.16, 12.4)),
    interiorFloorMat
  );
  classroomFloorWest.position.set(-14.2, 0.04, -16.1);
  classroomFloorWest.receiveShadow = true;
  interiorGroup.add(classroomFloorWest);

  const libraryFloorEast = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(17.2, 0.16, 12.4)),
    interiorFloorMat
  );
  libraryFloorEast.position.set(14.2, 0.04, -16.1);
  libraryFloorEast.receiveShadow = true;
  interiorGroup.add(libraryFloorEast);

  const lobbyHallwayFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(11.4, 0.17, 12.6)),
    hallwayTileMat
  );
  lobbyHallwayFloor.position.set(0, 0.045, -16.1);
  lobbyHallwayFloor.receiveShadow = true;
  interiorGroup.add(lobbyHallwayFloor);

  // Welcoming Blue Entrance Mat at Front Door (0, 0.06, -10.2)
  const welcomeMat = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.4, 0.06, 2.2)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.9,
      })
    )
  );
  welcomeMat.position.set(0, 0.07, -10.2);
  interiorGroup.add(welcomeMat);

  // 2B. Ground-Floor Perimeter & Partition Walls (Height = 4.5m)
  // Front South Wall Left & Right (leaving x: -2.8..+2.8 open for the Front Entrance!)
  const frontWallLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(20.0, 4.5, 0.45)),
    facadeMaterial
  );
  frontWallLeft.position.set(-12.8, 2.25, -9.8);
  frontWallLeft.castShadow = true;
  frontWallLeft.receiveShadow = true;
  interiorGroup.add(frontWallLeft);

  const frontWallRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(20.0, 4.5, 0.45)),
    facadeMaterial
  );
  frontWallRight.position.set(12.8, 2.25, -9.8);
  frontWallRight.castShadow = true;
  frontWallRight.receiveShadow = true;
  interiorGroup.add(frontWallRight);

  // Back North Wall Left & Right (leaving x: -2.8..+2.8 open to walk out to the North Sports Field!)
  const backWallLeft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(20.0, 4.5, 0.45)),
    interiorWallMat
  );
  backWallLeft.position.set(-12.8, 2.25, -22.3);
  backWallLeft.castShadow = true;
  backWallLeft.receiveShadow = true;
  interiorGroup.add(backWallLeft);

  const backWallRight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(20.0, 4.5, 0.45)),
    interiorWallMat
  );
  backWallRight.position.set(12.8, 2.25, -22.3);
  backWallRight.castShadow = true;
  backWallRight.receiveShadow = true;
  interiorGroup.add(backWallRight);

  // Far West & Far East Exterior Ground Floor Walls
  const farWestWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.45, 4.5, 12.8)),
    facadeMaterial
  );
  farWestWall.position.set(-22.8, 2.25, -16.05);
  farWestWall.castShadow = true;
  interiorGroup.add(farWestWall);

  const farEastWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.45, 4.5, 12.8)),
    facadeMaterial
  );
  farEastWall.position.set(22.8, 2.25, -16.05);
  farEastWall.castShadow = true;
  interiorGroup.add(farEastWall);

  // Interior Hallway Partition Walls (with wide 4.4m open doorways into Classroom 2-A & Library!)
  [-5.6, 5.6].forEach((partX) => {
    const southSeg = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.3, 4.5, 3.8)),
      interiorWallMat
    );
    southSeg.position.set(partX, 2.25, -11.8);
    interiorGroup.add(southSeg);

    const northSeg = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.3, 4.5, 3.8)),
      interiorWallMat
    );
    northSeg.position.set(partX, 2.25, -20.3);
    interiorGroup.add(northSeg);
  });

  // 2C. Central Lobby Details: Japanese Shoe Lockers (Getabako) & Trophy Display
  const lockerGeo = trackGeo(new THREE.BoxGeometry(0.55, 2.1, 3.2));
  [-4.9, 4.9].forEach((lx) => {
    const locker = new THREE.Mesh(lockerGeo, lightWoodMat);
    locker.position.set(lx, 1.05, -11.9);
    locker.castShadow = true;
    interiorGroup.add(locker);
  });

  // 2D. West Classroom 2-A Interior (Chalkboard, Teacher Podium, 12 Student Desks & Chairs)
  const chalkboardFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.6, 2.15, 0.14)),
    woodMat
  );
  chalkboardFrame.position.set(-14.2, 2.35, -21.95);
  interiorGroup.add(chalkboardFrame);

  const chalkboardSurface = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.2, 1.85, 0.18)),
    chalkboardMat
  );
  chalkboardSurface.position.set(-14.2, 2.35, -21.93);
  interiorGroup.add(chalkboardSurface);

  const teacherPodium = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 1.05, 1.1)),
    woodMat
  );
  teacherPodium.position.set(-14.2, 0.52, -19.5);
  teacherPodium.castShadow = true;
  interiorGroup.add(teacherPodium);

  // 12 Instanced Student Desks + Chairs in Classroom 2-A
  const deskCols = [-18.2, -14.2, -10.2];
  const deskRows = [-17.2, -15.0, -12.8];
  const totalDesks = deskCols.length * deskRows.length;
  const deskTopGeo = trackGeo(new THREE.BoxGeometry(1.35, 0.74, 0.85));
  const deskInstanced = new THREE.InstancedMesh(deskTopGeo, lightWoodMat, totalDesks);
  deskInstanced.castShadow = true;
  deskInstanced.receiveShadow = true;

  const chairGeo = trackGeo(new THREE.BoxGeometry(0.65, 0.46, 0.65));
  const chairInstanced = new THREE.InstancedMesh(chairGeo, darkTrimMat, totalDesks);

  const dummy = new THREE.Object3D();
  let deskIdx = 0;
  for (const dx of deskCols) {
    for (const dz of deskRows) {
      dummy.position.set(dx, 0.37, dz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      deskInstanced.setMatrixAt(deskIdx, dummy.matrix);

      dummy.position.set(dx, 0.23, dz + 0.68);
      dummy.updateMatrix();
      chairInstanced.setMatrixAt(deskIdx, dummy.matrix);
      deskIdx++;
    }
  }
  deskInstanced.instanceMatrix.needsUpdate = true;
  chairInstanced.instanceMatrix.needsUpdate = true;
  interiorGroup.add(deskInstanced);
  interiorGroup.add(chairInstanced);

  // 2E. East Library & Student Council Room Interior (Bookshelves + Council Table)
  const shelfGeo = trackGeo(new THREE.BoxGeometry(3.6, 3.2, 0.65));
  [9.8, 14.2, 18.6].forEach((sx) => {
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(sx, 1.6, -21.6);
    shelf.castShadow = true;
    interiorGroup.add(shelf);
  });

  const councilTable = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(5.2, 0.78, 2.4)),
    woodMat
  );
  councilTable.position.set(14.2, 0.39, -15.8);
  councilTable.castShadow = true;
  interiorGroup.add(councilTable);

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

  // Warm Interior Ceiling Lights for Lobby, Classroom 2-A, and Library
  const ceilingLightPositions: Array<[number, number, number]> = [
    [0, 4.2, -15.5],
    [-14.2, 4.2, -16.0],
    [14.2, 4.2, -16.0],
  ];
  for (const [lx, ly, lz] of ceilingLightPositions) {
    const panel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.4, 0.1, 1.2)),
      lanternBulbMaterial
    );
    panel.position.set(lx, 4.42, lz);
    interiorGroup.add(panel);

    const pt = new THREE.PointLight(0xfff4d6, 1.65, 18, 1.5);
    pt.position.set(lx, ly, lz);
    interiorGroup.add(pt);
  }

  // 2F. Monumental 4-Story Upper Wing of Hoshino Academy (Supported above y = 4.5m so Ground Floor is Open!)
  const upperWing = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(58, 9.2, 14.2)),
    facadeMaterial
  );
  upperWing.position.set(0, 4.5 + 4.6, -16.05);
  upperWing.castShadow = true;
  upperWing.receiveShadow = true;
  rootGroup.add(upperWing);

  // 4th Floor Grand Academic Penthouse Tier
  const penthouseWing = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(46, 4.8, 13.2)),
    facadeMaterial
  );
  penthouseWing.position.set(0, 13.7 + 2.4, -16.05);
  penthouseWing.castShadow = true;
  penthouseWing.receiveShadow = true;
  rootGroup.add(penthouseWing);

  // Main Wing Cornice & Grand Pitched Roof
  const mainCornice = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(59.6, 0.75, 15.0)),
    darkTrimMat
  );
  mainCornice.position.set(0, 18.7, -16.05);
  mainCornice.castShadow = true;
  rootGroup.add(mainCornice);

  const mainRoof = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(36, 4.8, 4)),
    roofMat
  );
  mainRoof.rotation.y = Math.PI / 4;
  mainRoof.scale.set(1.25, 1, 0.42);
  mainRoof.position.set(0, 21.4, -16.05);
  mainRoof.castShadow = true;
  rootGroup.add(mainRoof);

  // 2G. Architectural facade system: framed glazing, floor bands and balcony rails.
  const glazingMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x8bb9c8, metalness: 0.42, roughness: 0.18,
    transparent: true, opacity: 0.72,
  }));
  const windowFrameMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x263548, metalness: 0.72, roughness: 0.32,
  }));
  const sillMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0xc4c9ce, metalness: 0.18, roughness: 0.58,
  }));
  const addFacadeWindow = (x: number, y: number, z: number, width: number, height: number, facing: 'south' | 'north' = 'south') => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    if (facing === 'north') group.rotation.y = Math.PI;
    const depth = 0.16;
    const pane = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(width, height, 0.055)), glazingMat);
    pane.position.z = 0.02;
    group.add(pane);
    const frameGeo = trackGeo(new THREE.BoxGeometry(0.12, height + 0.22, depth));
    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(frameGeo, windowFrameMat);
      jamb.position.set(side * (width / 2 + 0.06), 0, 0);
      group.add(jamb);
    }
    const railGeo = trackGeo(new THREE.BoxGeometry(width + 0.24, 0.12, depth));
    for (const edge of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, windowFrameMat);
      rail.position.y = edge * (height / 2 + 0.06);
      group.add(rail);
    }
    const mullion = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.075, height, depth)), windowFrameMat);
    group.add(mullion);
    const sill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(width + 0.38, 0.14, 0.42)), sillMat);
    sill.position.set(0, -height / 2 - 0.12, 0.12);
    group.add(sill);
    group.traverse((node) => {
      if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = true; }
    });
    rootGroup.add(group);
  };
  const addBalconyRail = (x: number, y: number, z: number, width: number) => {
    const balcony = new THREE.Group();
    balcony.position.set(x, y, z);
    const slab = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(width + 0.8, 0.22, 1.05)), sillMat);
    slab.position.z = 0.28;
    balcony.add(slab);
    const topRail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(width + 0.8, 0.09, 0.09)), windowFrameMat);
    topRail.position.set(0, 1.02, 0.78);
    balcony.add(topRail);
    const lowerRail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(width + 0.8, 0.07, 0.07)), windowFrameMat);
    lowerRail.position.set(0, 0.38, 0.78);
    balcony.add(lowerRail);
    const postGeo = trackGeo(new THREE.BoxGeometry(0.07, 1.05, 0.07));
    const postCount = Math.max(3, Math.floor(width / 0.8));
    for (let i = 0; i <= postCount; i++) {
      const post = new THREE.Mesh(postGeo, windowFrameMat);
      post.position.set(-width / 2 + (width * i) / postCount, 0.68, 0.78);
      balcony.add(post);
    }
    rootGroup.add(balcony);
  };
  // Main academic facade: four readable horizontal levels with repeated framed bays.
  for (const y of [6.6, 9.5, 12.4, 15.5]) {
    for (const x of [-23, -15.5, -8, 8, 15.5, 23]) {
      addFacadeWindow(x, y, -8.88, 3.1, 1.9);
    }
    const band = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(58.8, 0.18, 0.42)), sillMat);
    band.position.set(0, y - 1.25, -8.93);
    rootGroup.add(band);
  }
  for (const x of [-15.5, 15.5]) addBalconyRail(x, 8.25, -8.95, 5.2);
  // North-facing glazing repeats the facade language without copying the entrance frontage.
  for (const y of [6.6, 9.5, 12.4]) {
    for (const x of [-22, -14, -6, 6, 14, 22]) addFacadeWindow(x, y, -23.2, 3.0, 1.85, 'north');
  }
  // Distinct window bays and floor bands give the east/west wings their own scale.
  for (const wx of [-21.2, 21.2]) {
    for (const y of [2.8, 6.8, 10.8]) {
      for (const z of [-7.0, -2.5, 2.0]) {
        const bay = new THREE.Group();
        bay.position.set(wx + (wx < 0 ? 6.18 : -6.18), y, z);
        bay.rotation.y = wx < 0 ? -Math.PI / 2 : Math.PI / 2;
        const pane = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.7, 2.0, 0.055)), glazingMat);
        bay.add(pane);
        const frame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.95, 2.18, 0.14)), windowFrameMat);
        const cutout = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.7, 2.0, 0.18)), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, transparent: true, opacity: 0 }));
        void frame; void cutout;
        rootGroup.add(bay);
      }
    }
  }
  // Central Entrance Portico & Columns (Flanking the Open Entrance Doors!)
  const porticoCanopy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(14.5, 0.85, 5.8)),
    creamWallMat
  );
  porticoCanopy.position.set(0, 4.65, -7.6);
  porticoCanopy.castShadow = true;
  porticoCanopy.receiveShadow = true;
  rootGroup.add(porticoCanopy);

  // Overhead "HOSHINO ACADEMY" Gold Plaque & Faded Star Emblem above Front Doors
  const entrancePlaque = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(6.8, 0.78, 0.28)),
    goldAccentMat
  );
  entrancePlaque.position.set(0, 4.72, -4.85);
  rootGroup.add(entrancePlaque);

  const fadedStarEmblem = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.68, 0.68, 0.22, 8)),
    goldAccentMat
  );
  fadedStarEmblem.rotation.x = Math.PI / 2;
  fadedStarEmblem.position.set(0, 5.65, -4.85);
  rootGroup.add(fadedStarEmblem);

  const columnGeo = trackGeo(new THREE.CylinderGeometry(0.42, 0.48, 4.5, 12));
  [-5.8, -3.3, 3.3, 5.8].forEach((cx) => {
    const col = new THREE.Mesh(columnGeo, creamWallMat);
    col.position.set(cx, 2.25, -5.6);
    col.castShadow = true;
    col.receiveShadow = true;
    rootGroup.add(col);
  });

  // ==========================================================================
  // 3. MONUMENTAL 36M CENTRAL CLOCK TOWER & ILLUMINATED DIAL
  // ==========================================================================
  const towerShaft = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(9.2, 14.5, 9.2)),
    creamWallMat
  );
  towerShaft.position.set(0, 24.8, -15.5);
  towerShaft.castShadow = true;
  towerShaft.receiveShadow = true;
  rootGroup.add(towerShaft);

  const towerTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.0, 0.75, 10.0)),
    darkTrimMat
  );
  towerTrim.position.set(0, 32.2, -15.5);
  rootGroup.add(towerTrim);

  const towerSpire = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(7.6, 7.2, 4)),
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
  clockRim.position.set(0, 27.2, -10.85);
  rootGroup.add(clockRim);

  const clockFace = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.35, 2.35, 0.36, 24)),
    lanternBulbMaterial
  );
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(0, 27.2, -10.82);
  rootGroup.add(clockFace);

  const clockHourHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.2, 1.35, 0.12)),
    darkTrimMat
  );
  clockHourHand.position.set(0, 27.2, -10.6);
  clockHourHand.rotation.z = -Math.PI / 3;
  rootGroup.add(clockHourHand);

  const clockMinuteHand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 1.9, 0.12)),
    darkTrimMat
  );
  clockMinuteHand.position.set(0, 27.2, -10.58);
  clockMinuteHand.rotation.z = Math.PI / 6;
  rootGroup.add(clockMinuteHand);

  // ==========================================================================
  // 4. ENLARGED EAST & WEST WINGS, GYMNASIUM, CAFETERIA & 4-STORY STUDENT DORMITORY
  // ==========================================================================
  const sideWingGeo = trackGeo(new THREE.BoxGeometry(12.2, 13.6, 14.4));
  const sideRoofGeo = trackGeo(new THREE.ConeGeometry(11.4, 3.6, 4));

  [-21.2, 21.2].forEach((wx) => {
    const wing = new THREE.Mesh(sideWingGeo, facadeMaterial);
    wing.position.set(wx, 6.8, -2.5);
    wing.castShadow = true;
    wing.receiveShadow = true;
    rootGroup.add(wing);

    const sRoof = new THREE.Mesh(sideRoofGeo, roofMat);
    sRoof.rotation.y = Math.PI / 4;
    sRoof.scale.set(0.84, 1, 1.18);
    sRoof.position.set(wx, 15.3, -2.5);
    sRoof.castShadow = true;
    rootGroup.add(sRoof);
  });

  // Grand East Gymnasium & Sports Arena (x: 38.5, z: 8, 16m x 11.6m x 22m)
  const gymBuilding = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.0, 11.6, 22.0)),
    creamWallMat
  );
  gymBuilding.position.set(38.5, 5.8, 8.0);
  gymBuilding.castShadow = true;
  gymBuilding.receiveShadow = true;
  rootGroup.add(gymBuilding);

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
    trackGeo(new THREE.BoxGeometry(52, 0.12, 22)),
    trackClayMat
  );
  northTrackSurface.position.set(0, 0.02, -35.0);
  northTrackSurface.receiveShadow = true;
  rootGroup.add(northTrackSurface);

  const soccerInfield = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(38, 0.15, 13)),
    grassMat
  );
  soccerInfield.position.set(0, 0.035, -35.0);
  soccerInfield.receiveShadow = true;
  rootGroup.add(soccerInfield);

  // Soccer Goalposts at West (-18.5) and East (+18.5) ends of the North Field
  const goalPostMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  );
  [-18.5, 18.5].forEach((gx) => {
    const crossbar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.18, 0.18, 4.2)),
      goalPostMat
    );
    crossbar.position.set(gx, 2.2, -35.0);
    rootGroup.add(crossbar);

    [-2.0, 2.0].forEach((gzOff) => {
      const post = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8)),
        goalPostMat
      );
      post.position.set(gx, 1.1, -35.0 + gzOff);
      rootGroup.add(post);
    });
  });

  // ==========================================================================
  // 6. COURTYARD OCTAGONAL FOUNTAIN & BENCHES
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

    [-1.2, 1.2].forEach((lx) => {
      const leg = new THREE.Mesh(benchLegGeo, darkTrimMat);
      leg.position.set(lx, 0.25, 0);
      leg.castShadow = true;
      bGroup.add(leg);
    });

    rootGroup.add(bGroup);
  }

  // ==========================================================================
  // 7. SOUTH GATE PILLARS & PERIMETER WALLS
  // ==========================================================================
  const gatePillarGeo = trackGeo(new THREE.BoxGeometry(1.8, 4.6, 1.8));
  const gateCapGeo = trackGeo(new THREE.BoxGeometry(2.2, 0.45, 2.2));
  [-4.8, 4.8].forEach((gx) => {
    const pillar = new THREE.Mesh(gatePillarGeo, stoneMat);
    pillar.position.set(gx, 2.3, 35);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    rootGroup.add(pillar);

    const cap = new THREE.Mesh(gateCapGeo, darkTrimMat);
    cap.position.set(gx, 4.7, 35);
    rootGroup.add(cap);
  });

  const perimeterWallGeo = trackGeo(new THREE.BoxGeometry(26, 2.2, 0.7));
  [-18.5, 18.5].forEach((wx) => {
    const wall = new THREE.Mesh(perimeterWallGeo, creamWallMat);
    wall.position.set(wx, 1.1, 35);
    wall.castShadow = true;
    wall.receiveShadow = true;
    rootGroup.add(wall);
  });

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
    // Expanded South Town Boulevard Sakura Trees
    [-11.5, 46, 1.08],
    [11.5, 46, 1.06],
    [-11.5, 76, 1.12],
    [11.5, 76, 1.1],
    // Expanded West Koi Garden & East Pool Promenade Trees
    [-50.0, 20, 1.18],
    [-50.0, -4, 1.1],
    [50.0, 20, 1.15],
    [50.0, -4, 1.08],
    // North Shrine Approach Trees
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

  // Outdoor Cafeteria & Town Cafe Dining Tables with Festival Parasols
  const cafeTablePositions: Array<[number, number]> = [
    [-27.5, 3.8],
    [-27.5, 12.2],
    [-14.5, 58.0],
    [-14.5, 66.0],
  ];
  const roundTableGeo = trackGeo(new THREE.CylinderGeometry(1.15, 1.15, 0.12, 12));
  const tablePedestalGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.24, 0.78, 8));
  const parasolConeGeo = trackGeo(new THREE.ConeGeometry(1.65, 0.65, 10));
  const crimsonMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.55,
      metalness: 0.08,
    })
  );

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
  // 8B. 4X EXPANDED DISTRICTS:
  //  - SOUTH: SEIRAN TOWN SHOPPING STREET & ELECTRIC RAILWAY STATION (z = 42..102)
  //  - EAST:  OLYMPIC 25M SWIMMING POOL COMPLEX & OBSERVATORY DOME (x = 50..82)
  //  - WEST:  JAPANESE KOI POND, VERMILION BRIDGE & FESTIVAL STAGE (x = -50..-82)
  //  - NORTH: HILLTOP TORII SHRINE & BASKETBALL COURTS (z = -48..-92)
  // ==========================================================================

  // --- SOUTH DISTRICT: Town Crosswalk Stripes, Shops & Seiran Train Station ---
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

  // Multi-Story West Town Building: Hoshino Manga, Books & Ramen Cafe (x = -26, z = 62, 16.5m x 13.5m x 20.5m)
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

  // Multi-Story East Town Building: Hoshino Town Plaza & Konbini Mart (x = +26, z = 62, 16.5m x 13.5m x 20.5m)
  const eastTownShop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(16.5, 13.5, 20.5)),
    facadeMaterial
  );
  eastTownShop.position.set(26.0, 6.75, 62.0);
  eastTownShop.castShadow = true;
  eastTownShop.receiveShadow = true;
  rootGroup.add(eastTownShop);

  const konbiniSignMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.3,
    })
  );
  const eastShopSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 0.85, 18.5)),
    konbiniSignMat
  );
  eastShopSign.position.set(17.0, 3.6, 62.0);
  rootGroup.add(eastShopSign);

  // Hoshino Electric Railway Station Terminal Platform & Grand Canopy (x = 0, z = 94.5)
  const stationPlatform = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(62.0, 0.85, 8.2)),
    stoneMat
  );
  stationPlatform.position.set(0, 0.425, 94.5);
  stationPlatform.receiveShadow = true;
  rootGroup.add(stationPlatform);

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
      konbiniSignMat
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

  // --- EAST DISTRICT: Hoshino 25m Aquatics Swimming Pool & Grand Research Centre Dome ---
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

  // Swimming Pool Starting Blocks at South End (z = 19.6)
  const blockGeo = trackGeo(new THREE.BoxGeometry(0.8, 0.65, 0.8));
  for (const pbx of [60.5, 64.2, 67.8, 71.5]) {
    const sBlock = new THREE.Mesh(blockGeo, stoneMat);
    sBlock.position.set(pbx, 0.4, 19.6);
    sBlock.castShadow = true;
    rootGroup.add(sBlock);
  }

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

  // --- WEST DISTRICT: Japanese Koi Pond, Vermilion Bridge & Festival Concert Stage ---
  const koiPondWater = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(18.0, 0.14, 24.0)),
    waterMat
  );
  koiPondWater.position.set(-66.0, 0.04, 8.0);
  rootGroup.add(koiPondWater);

  // Walkable Vermilion Japanese Bridge spanning the Koi Pond (x = -76..-56, z = 8)
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

  // Northwest Outdoor Festival Amphitheater & Music Stage (x = -66, z = -26)
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

  // Grand Hoshino Mountain Shrine Sanctuary Hall (x = 0, z = -90.2, 18.5m x 8.8m x 10.0m)
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

  // Outdoor Basketball Courts at North-West (-24, -60) and North-East (+24, -60)
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
  // 9. DISTANT CITY SKYLINE SILHOUETTES (Pushed out beyond 4X Expanded World)
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
      vx: -0.45 - ((i % 7) * 0.08),
      vy: -0.55 - ((i % 5) * 0.09),
      vz: 0.25 + ((i % 6) * 0.06),
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
  // 11. PHASE 8 REALISTIC WORLD ENHANCEMENTS & VOLUMETRIC SKY WEATHER CLOUDS
  // ==========================================================================
  // 11A. Manicured Courtyard Hedges along Main Walkways
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

  // 11B. Framed Open Glass Entrance Doors at School Main Portico (x = +-2.55, z = -9.75)
  const doorGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.65,
    })
  );
  for (const dx of [-2.55, 2.55]) {
    const doorFrame = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.18, 3.6, 1.35)),
      darkTrimMat
    );
    doorFrame.position.set(dx, 1.8, -9.2);
    rootGroup.add(doorFrame);

    const doorGlass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.08, 3.2, 1.15)),
      doorGlassMat
    );
    doorGlass.position.set(dx, 1.8, -9.2);
    rootGroup.add(doorGlass);
  }

  // 11C. Wooden Pergola Beams above West Cafeteria Outdoor Terrace (x = -28, z = 8)
  const pergolaBeamGeo = trackGeo(new THREE.BoxGeometry(6.8, 0.22, 0.28));
  for (let pz = 2.0; pz <= 14.0; pz += 2.4) {
    const beam = new THREE.Mesh(pergolaBeamGeo, woodMat);
    beam.position.set(-28.2, 3.85, pz);
    beam.castShadow = true;
    rootGroup.add(beam);
  }

  // 11D. Railway Tracks & Wooden Sleepers under the Seiran Commuter Train (z = 100.5)
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

  // 11E. Dynamic Volumetric 3D Sky Cloud Clusters & Celestial Sun/Moon Orb
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
    dispose,
  };
}
