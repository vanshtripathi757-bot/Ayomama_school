import * as THREE from 'three';
import { CharacterCustomization, NpcGreetingAnimationType } from '../../types/game';

export interface CharacterActorRig {
  root: THREE.Group;
  bodyScaleGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  markerMesh?: THREE.Mesh;
  hairMat?: THREE.MeshStandardMaterial;
  skinMat?: THREE.MeshStandardMaterial;
  blazerMat?: THREE.MeshStandardMaterial;
  trouserSkirtMat?: THREE.MeshStandardMaterial;
  accentTieMat?: THREE.MeshStandardMaterial;
  irisMat?: THREE.MeshBasicMaterial;
  leftLegMesh?: THREE.Mesh;
  rightLegMesh?: THREE.Mesh;
  malePelvisMesh?: THREE.Mesh;
  femaleSkirtMesh?: THREE.Mesh;
  maleSpikesGroup?: THREE.Group;
  femaleTailGroup?: THREE.Group;
  glassesGroup?: THREE.Group;
  armbandGroup?: THREE.Group;
  headphonesGroup?: THREE.Group;
  heldBookGroup?: THREE.Group;
  dispose: () => void;
}

export function applyCharacterCustomizationToRig(
  rig: CharacterActorRig,
  custom?: CharacterCustomization
): void {
  if (!custom) return;
  if (rig.hairMat) {
    rig.hairMat.color.setHex(custom.hairColor);
  }
  if (rig.skinMat) {
    rig.skinMat.color.setHex(custom.skinColor);
  }
  if (rig.irisMat) {
    rig.irisMat.color.setHex(custom.eyeColor);
  }
  if (rig.blazerMat) {
    const outfitColor =
      custom.outfit === 'summer_vest'
        ? 0x334155
        : custom.outfit === 'casual_hoodie'
          ? 0x4338ca
          : custom.outfit === 'sports_tracksuit'
            ? 0x0f766e
            : 0x172554;
    rig.blazerMat.color.setHex(outfitColor);
  }
  if (rig.accentTieMat) {
    const classAccent =
      custom.academyClass === 'Class A'
        ? 0xe11d48
        : custom.academyClass === 'Class B'
          ? 0x38bdf8
          : custom.academyClass === 'Class C'
            ? 0xa855f7
            : 0x10b981;
    rig.accentTieMat.color.setHex(classAccent);
    rig.accentTieMat.emissive.setHex(classAccent);
  }

  // Dynamic Gender Silhouette (Male Trousers + Spiky Hair vs Female Pleated Skirt + Ponytail)
  const isMale = custom.gender !== 'Female';
  if (rig.malePelvisMesh) rig.malePelvisMesh.visible = isMale;
  if (rig.femaleSkirtMesh) rig.femaleSkirtMesh.visible = !isMale;
  if (rig.maleSpikesGroup) {
    rig.maleSpikesGroup.visible =
      isMale && custom.hairStyle !== 'long' && custom.hairStyle !== 'bob';
  }
  if (rig.femaleTailGroup) {
    rig.femaleTailGroup.visible =
      !isMale || custom.hairStyle === 'long';
  }
  if (rig.leftLegMesh && rig.rightLegMesh && rig.trouserSkirtMat && rig.skinMat) {
    rig.leftLegMesh.material = isMale ? rig.trouserSkirtMat : rig.skinMat;
    rig.rightLegMesh.material = isMale ? rig.trouserSkirtMat : rig.skinMat;
  }

  // Dynamic 3D Accessories (Scholar Glasses, Council Armband, Headphones)
  if (rig.glassesGroup) {
    rig.glassesGroup.visible = custom.accessory === 'glasses';
  }
  if (rig.armbandGroup) {
    rig.armbandGroup.visible = custom.accessory === 'armband';
  }
  if (rig.headphonesGroup) {
    rig.headphonesGroup.visible = custom.accessory === 'headphones';
  }

  const hScale = Math.max(0.88, Math.min(1.12, custom.heightScale || 1.0));
  const bScale = Math.max(0.88, Math.min(1.12, custom.bodyScale || 1.0));
  rig.root.scale.set(bScale, hScale, bScale);
}

export interface CharacterStyleConfig {
  hairColor: number;
  blazerColor: number;
  accentColor: number;
  skinColor?: number;
  gender?: 'male' | 'female';
  isProtagonist?: boolean;
  contactShadowMap?: THREE.Texture;
}

/**
 * Constructs a composite procedural 3D anime school student character
 * anchored at bottom-center (y = 0) with articulated arm/leg joints for gait animation.
 * Supports distinct Male (tailored trousers, broad blazer shoulders, necktie, spiky short hair)
 * and Female (pleated skirt, sailor ribbon, long hair tail) silhouettes + 3D Accessories.
 */
export function createAnimeCharacterRig(
  config: CharacterStyleConfig
): CharacterActorRig {
  const isMale = (config.gender ?? (config.isProtagonist ? 'male' : 'female')) === 'male';
  const root = new THREE.Group();
  const bodyScaleGroup = new THREE.Group();
  root.add(bodyScaleGroup);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackG = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackM = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const skinMat = trackM(
    new THREE.MeshStandardMaterial({
      color: config.skinColor ?? 0xffe4d6,
      roughness: 0.65,
      metalness: 0.02,
    })
  );

  const hairMat = trackM(
    new THREE.MeshStandardMaterial({
      color: config.hairColor,
      roughness: 0.42,
      metalness: 0.12,
    })
  );

  const blazerMat = trackM(
    new THREE.MeshStandardMaterial({
      color: config.blazerColor,
      roughness: 0.7,
      metalness: 0.08,
    })
  );

  const trouserSkirtMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.78,
      metalness: 0.05,
    })
  );

  const shirtWhiteMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.55,
      metalness: 0.02,
    })
  );

  const accentTieMat = trackM(
    new THREE.MeshStandardMaterial({
      color: config.accentColor,
      emissive: new THREE.Color(config.accentColor),
      emissiveIntensity: 0.2,
      roughness: 0.38,
      metalness: 0.15,
    })
  );

  const shoeMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.35,
      metalness: 0.25,
    })
  );

  // 1. Ground Radial Contact Shadow Disc (y = 0.02)
  if (config.contactShadowMap) {
    const shadowMat = trackM(
      new THREE.MeshBasicMaterial({
        map: config.contactShadowMap,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    const shadowDisc = new THREE.Mesh(
      trackG(new THREE.PlaneGeometry(1.35, 1.35)),
      shadowMat
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.02;
    root.add(shadowDisc);
  }

  // 2. Articulated Left & Right Legs + Loafers
  const legGeo = trackG(
    new THREE.CylinderGeometry(isMale ? 0.095 : 0.082, isMale ? 0.082 : 0.068, 0.7, 10)
  );
  const shoeGeo = trackG(new THREE.BoxGeometry(0.16, 0.1, 0.27));
  const legMaterial = isMale ? trouserSkirtMat : skinMat;

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(isMale ? -0.135 : -0.125, 0.72, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, legMaterial);
  leftLegMesh.position.y = -0.34;
  leftLegMesh.castShadow = true;
  leftLegPivot.add(leftLegMesh);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.66, 0.04);
  leftLegPivot.add(leftShoe);
  bodyScaleGroup.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(isMale ? 0.135 : 0.125, 0.72, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, legMaterial);
  rightLegMesh.position.y = -0.34;
  rightLegMesh.castShadow = true;
  rightLegPivot.add(rightLegMesh);
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.66, 0.04);
  rightLegPivot.add(rightShoe);
  bodyScaleGroup.add(rightLegPivot);

  // 3. Lower Uniform Waist (Both Male Pelvis and Female Pleated Skirt created so Gender can toggle live!)
  const malePelvisMesh = new THREE.Mesh(
    trackG(new THREE.BoxGeometry(0.42, 0.2, 0.24)),
    trouserSkirtMat
  );
  malePelvisMesh.position.set(0, 0.79, 0);
  malePelvisMesh.castShadow = true;
  malePelvisMesh.visible = isMale;
  bodyScaleGroup.add(malePelvisMesh);

  const femaleSkirtMesh = new THREE.Mesh(
    trackG(new THREE.CylinderGeometry(0.19, 0.28, 0.32, 12)),
    trouserSkirtMat
  );
  femaleSkirtMesh.position.set(0, 0.78, 0);
  femaleSkirtMesh.castShadow = true;
  femaleSkirtMesh.visible = !isMale;
  bodyScaleGroup.add(femaleSkirtMesh);

  // 4. Hoshino Academy Blazer Torso, Lapels, Gold Crest & Necktie / Collar
  const goldCrestMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: new THREE.Color(0xd97706),
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.85,
    })
  );

  if (isMale) {
    const maleTorsoMesh = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.46, 0.56, 0.26)),
      blazerMat
    );
    maleTorsoMesh.position.set(0, 1.15, 0);
    maleTorsoMesh.castShadow = true;
    bodyScaleGroup.add(maleTorsoMesh);

    const shirtCollar = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.22, 0.17, 0.27)),
      shirtWhiteMat
    );
    shirtCollar.position.set(0, 1.34, 0.01);
    bodyScaleGroup.add(shirtCollar);

    const maleNecktie = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.065, 0.34, 0.04)),
      accentTieMat
    );
    maleNecktie.position.set(0, 1.19, 0.136);
    bodyScaleGroup.add(maleNecktie);

    const chestCrest = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.065, 0.075, 0.02)),
      goldCrestMat
    );
    chestCrest.position.set(-0.13, 1.24, 0.135);
    bodyScaleGroup.add(chestCrest);
  } else {
    const torsoMesh = new THREE.Mesh(
      trackG(new THREE.CylinderGeometry(0.21, 0.18, 0.54, 12)),
      blazerMat
    );
    torsoMesh.position.set(0, 1.14, 0);
    torsoMesh.castShadow = true;
    bodyScaleGroup.add(torsoMesh);

    const shirtFront = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.18, 0.22, 0.23)),
      shirtWhiteMat
    );
    shirtFront.position.set(0, 1.26, 0.06);
    bodyScaleGroup.add(shirtFront);

    const collarRibbon = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.2, 0.12, 0.24)),
      accentTieMat
    );
    collarRibbon.position.set(0, 1.28, 0.09);
    bodyScaleGroup.add(collarRibbon);

    const chestCrest = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.055, 0.065, 0.02)),
      goldCrestMat
    );
    chestCrest.position.set(-0.1, 1.22, 0.125);
    bodyScaleGroup.add(chestCrest);
  }

  // 5. Articulated Left & Right Arms + White Shirt Cuffs + Optional Council Armband
  const armGeo = trackG(
    new THREE.CylinderGeometry(isMale ? 0.078 : 0.068, isMale ? 0.068 : 0.058, 0.52, 8)
  );
  const cuffGeo = trackG(new THREE.CylinderGeometry(0.066, 0.066, 0.06, 8));
  const handGeo = trackG(new THREE.SphereGeometry(0.065, 8, 8));
  const shoulderX = isMale ? 0.31 : 0.265;

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-shoulderX, 1.36, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, blazerMat);
  leftArmMesh.position.y = -0.21;
  leftArmMesh.castShadow = true;
  leftArmPivot.add(leftArmMesh);
  const leftCuff = new THREE.Mesh(cuffGeo, shirtWhiteMat);
  leftCuff.position.y = -0.45;
  leftArmPivot.add(leftCuff);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.5;
  leftArmPivot.add(leftHand);

  // 3D Council / Class Leader Armband on Left Arm
  const armbandGroup = new THREE.Group();
  armbandGroup.visible = false;
  const armbandBand = new THREE.Mesh(
    trackG(new THREE.CylinderGeometry(0.088, 0.085, 0.09, 12)),
    trackM(
      new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        emissive: new THREE.Color(0x9f1239),
        emissiveIntensity: 0.25,
        roughness: 0.4,
      })
    )
  );
  armbandBand.position.set(0, -0.14, 0);
  armbandGroup.add(armbandBand);
  const armbandGoldStripe = new THREE.Mesh(
    trackG(new THREE.CylinderGeometry(0.09, 0.088, 0.025, 12)),
    goldCrestMat
  );
  armbandGoldStripe.position.set(0, -0.14, 0);
  armbandGroup.add(armbandGoldStripe);
  leftArmPivot.add(armbandGroup);

  bodyScaleGroup.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(shoulderX, 1.36, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, blazerMat);
  rightArmMesh.position.y = -0.21;
  rightArmMesh.castShadow = true;
  rightArmPivot.add(rightArmMesh);
  const rightCuff = new THREE.Mesh(cuffGeo, shirtWhiteMat);
  rightCuff.position.y = -0.45;
  rightArmPivot.add(rightCuff);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.5;
  rightArmPivot.add(rightHand);

  // Small procedural book prop attached to the articulated right hand.
  const heldBookGroup = new THREE.Group();
  heldBookGroup.visible = false;
  const heldBookCoverMat = trackM(new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.72 }));
  const heldBookPageMat = trackM(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.92 }));
  const heldBookCover = new THREE.Mesh(trackG(new THREE.BoxGeometry(0.25, 0.34, 0.035)), heldBookCoverMat);
  heldBookCover.castShadow = true;
  heldBookGroup.add(heldBookCover);
  const heldBookPages = new THREE.Mesh(trackG(new THREE.BoxGeometry(0.235, 0.322, 0.026)), heldBookPageMat);
  heldBookPages.position.z = 0.012;
  heldBookGroup.add(heldBookPages);
  const heldBookSpine = new THREE.Mesh(trackG(new THREE.BoxGeometry(0.035, 0.34, 0.04)), heldBookCoverMat);
  heldBookSpine.position.x = -0.108;
  heldBookGroup.add(heldBookSpine);
  heldBookGroup.position.set(0.035, -0.64, 0.105);
  heldBookGroup.rotation.set(-0.18, 0, -0.12);
  rightArmPivot.add(heldBookGroup);

  bodyScaleGroup.add(rightArmPivot);

  // 6. Head, Anime Hair Crown, Side Locks, Bangs & Detailed Anime Eyes
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.64, 0);

  const headSphere = new THREE.Mesh(
    trackG(new THREE.SphereGeometry(0.22, 16, 16)),
    skinMat
  );
  headSphere.castShadow = true;
  headGroup.add(headSphere);

  const hairCap = new THREE.Mesh(
    trackG(new THREE.SphereGeometry(0.238, 16, 16)),
    hairMat
  );
  hairCap.position.set(0, 0.045, -0.02);
  hairCap.scale.set(1.04, 1.03, 1.05);
  hairCap.castShadow = true;
  headGroup.add(hairCap);

  // Front Forehead Bangs & Side Hair Locks framing the face
  const bangGeo = trackG(new THREE.ConeGeometry(0.055, 0.16, 5));
  for (const bx of [-0.09, -0.03, 0.03, 0.09]) {
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.position.set(bx, 0.11, 0.195);
    bang.rotation.x = Math.PI * 0.92;
    headGroup.add(bang);
  }

  const sideLockGeo = trackG(
    new THREE.CylinderGeometry(0.042, 0.018, isMale ? 0.22 : 0.34, 6)
  );
  for (const sx of [-0.19, 0.19]) {
    const lock = new THREE.Mesh(sideLockGeo, hairMat);
    lock.position.set(sx, isMale ? -0.02 : -0.07, 0.07);
    lock.rotation.z = sx < 0 ? 0.12 : -0.12;
    headGroup.add(lock);
  }

  // Male Spiky Hair Tufts Group
  const maleSpikesGroup = new THREE.Group();
  maleSpikesGroup.visible = isMale;
  const spikeGeo = trackG(new THREE.ConeGeometry(0.068, 0.19, 5));
  const spikeTransforms: Array<[number, number, number, number, number, number]> = [
    [0, 0.26, 0.06, -0.4, 0, 0],
    [-0.11, 0.24, 0.04, -0.3, 0, 0.45],
    [0.11, 0.24, 0.04, -0.3, 0, -0.45],
    [-0.16, 0.17, -0.05, -0.1, 0, 0.75],
    [0.16, 0.17, -0.05, -0.1, 0, -0.75],
    [0, 0.23, -0.13, 0.45, 0, 0],
    [-0.09, 0.18, -0.16, 0.55, 0, 0.35],
    [0.09, 0.18, -0.16, 0.55, 0, -0.35],
  ];
  for (const [sx, sy, sz, rx, ry, rz] of spikeTransforms) {
    const spike = new THREE.Mesh(spikeGeo, hairMat);
    spike.position.set(sx, sy, sz);
    spike.rotation.set(rx, ry, rz);
    maleSpikesGroup.add(spike);
  }
  headGroup.add(maleSpikesGroup);

  // Female / Long Hair Back Ponytail + Ribbon Tie Group
  const femaleTailGroup = new THREE.Group();
  femaleTailGroup.visible = !isMale;
  const ribbonTie = new THREE.Mesh(
    trackG(new THREE.BoxGeometry(0.14, 0.07, 0.07)),
    accentTieMat
  );
  ribbonTie.position.set(0, 0.04, -0.22);
  femaleTailGroup.add(ribbonTie);

  const hairBackTail = new THREE.Mesh(
    trackG(new THREE.ConeGeometry(0.145, 0.4, 10)),
    hairMat
  );
  hairBackTail.position.set(0, -0.1, -0.24);
  hairBackTail.rotation.x = 0.38;
  femaleTailGroup.add(hairBackTail);
  headGroup.add(femaleTailGroup);

  // 3D Scholar Glasses Group (visible when accessory === 'glasses')
  const glassesGroup = new THREE.Group();
  glassesGroup.visible = false;
  const frameMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
    })
  );
  const lensMat = trackM(
    new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.42,
    })
  );
  for (const gx of [-0.078, 0.078]) {
    const rim = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.088, 0.068, 0.014)),
      frameMat
    );
    rim.position.set(gx, -0.008, 0.222);
    glassesGroup.add(rim);
    const lens = new THREE.Mesh(
      trackG(new THREE.BoxGeometry(0.074, 0.054, 0.016)),
      lensMat
    );
    lens.position.set(gx, -0.008, 0.224);
    glassesGroup.add(lens);
  }
  const bridge = new THREE.Mesh(
    trackG(new THREE.BoxGeometry(0.04, 0.012, 0.014)),
    frameMat
  );
  bridge.position.set(0, 0.004, 0.222);
  glassesGroup.add(bridge);
  headGroup.add(glassesGroup);

  // 3D Studio Headphones Group (visible when accessory === 'headphones')
  const headphonesGroup = new THREE.Group();
  headphonesGroup.visible = false;
  const hpMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.6,
    })
  );
  for (const hx of [-0.235, 0.235]) {
    const earcup = new THREE.Mesh(
      trackG(new THREE.CylinderGeometry(0.075, 0.075, 0.045, 12)),
      hpMat
    );
    earcup.rotation.z = Math.PI / 2;
    earcup.position.set(hx, 0.0, 0.02);
    headphonesGroup.add(earcup);
  }
  const headband = new THREE.Mesh(
    trackG(new THREE.TorusGeometry(0.245, 0.022, 8, 20, Math.PI)),
    hpMat
  );
  headband.position.set(0, 0.02, 0.02);
  headphonesGroup.add(headband);
  headGroup.add(headphonesGroup);

  // Detailed Multi-Layer Anime Eyes on +Z face (Sclera + Colored Iris + Pupil + White Catchlight)
  const scleraGeo = trackG(new THREE.BoxGeometry(0.062, 0.074, 0.018));
  const irisGeo = trackG(new THREE.BoxGeometry(0.046, 0.058, 0.02));
  const pupilGeo = trackG(new THREE.BoxGeometry(0.026, 0.036, 0.022));
  const highlightGeo = trackG(new THREE.BoxGeometry(0.016, 0.016, 0.025));
  const browGeo = trackG(new THREE.BoxGeometry(0.068, 0.015, 0.02));

  const scleraMat = trackM(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const irisMat = trackM(new THREE.MeshBasicMaterial({ color: config.accentColor }));
  const pupilMat = trackM(new THREE.MeshBasicMaterial({ color: 0x090d16 }));

  for (const ex of [-0.078, 0.078]) {
    const sclera = new THREE.Mesh(scleraGeo, scleraMat);
    sclera.position.set(ex, -0.01, 0.205);
    headGroup.add(sclera);

    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(ex, -0.012, 0.208);
    headGroup.add(iris);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(ex, -0.014, 0.21);
    headGroup.add(pupil);

    const catchlight = new THREE.Mesh(highlightGeo, scleraMat);
    catchlight.position.set(ex + 0.012, 0.006, 0.212);
    headGroup.add(catchlight);

    const brow = new THREE.Mesh(browGeo, hairMat);
    brow.position.set(ex, 0.042, 0.206);
    brow.rotation.z = ex < 0 ? -0.08 : 0.08;
    headGroup.add(brow);
  }

  bodyScaleGroup.add(headGroup);

  return {
    root,
    bodyScaleGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    hairMat,
    skinMat,
    blazerMat,
    trouserSkirtMat,
    accentTieMat,
    irisMat,
    leftLegMesh,
    rightLegMesh,
    malePelvisMesh,
    femaleSkirtMesh,
    maleSpikesGroup,
    femaleTailGroup,
    glassesGroup,
    armbandGroup,
    headphonesGroup,
    heldBookGroup,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

/**
 * Updates character limb swing, torso bob, and proximity-based NPC greeting / idle animations.
 */
export function updateCharacterRigAnimation(
  rig: CharacterActorRig,
  walkPhase: number,
  isMoving: boolean,
  isSprinting: boolean,
  squashY: number,
  squashXZ: number,
  elapsedTime: number,
  isGreetingPlayer: boolean = false,
  greetingAnim: NpcGreetingAnimationType = 'wave',
  activityIntent: 'idle' | 'reading' | 'working' | 'sitting' | 'teaching' = 'idle'
): void {
  rig.bodyScaleGroup.scale.set(squashXZ, squashY, squashXZ);

  if (isMoving) {
    const swingAmp = isSprinting ? 0.78 : 0.52;
    const armSwing = Math.sin(walkPhase) * swingAmp;
    const legSwing = Math.sin(walkPhase) * (swingAmp * 1.05);
    const bob = Math.abs(Math.cos(walkPhase)) * (isSprinting ? 0.065 : 0.038);

    rig.leftArmPivot.rotation.x = armSwing;
    rig.leftArmPivot.rotation.z = 0;
    rig.rightArmPivot.rotation.x = -armSwing;
    rig.rightArmPivot.rotation.z = 0;
    rig.leftLegPivot.rotation.x = -legSwing;
    rig.rightLegPivot.rotation.x = legSwing;
    rig.bodyScaleGroup.position.y = bob;
    rig.bodyScaleGroup.rotation.x *= 0.85;
    rig.headGroup.rotation.set(0, 0, 0);
  } else if (isGreetingPlayer) {
    // Unique Proximity Greeting Animations when Protagonist approaches NPC in the Courtyard!
    rig.leftLegPivot.rotation.x *= 0.82;
    rig.rightLegPivot.rotation.x *= 0.82;

    if (greetingAnim === 'bow') {
      // Polite Japanese Student Council Bow + Gentle Right Hand Wave
      const bowCycle = Math.max(0, Math.sin(elapsedTime * 2.2));
      rig.bodyScaleGroup.rotation.x = THREE.MathUtils.lerp(
        rig.bodyScaleGroup.rotation.x,
        0.24 * bowCycle,
        0.14
      );
      rig.bodyScaleGroup.position.y = Math.sin(elapsedTime * 2.6) * 0.015;
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(
        rig.rightArmPivot.rotation.x,
        -1.65,
        0.16
      );
      rig.rightArmPivot.rotation.z = Math.sin(elapsedTime * 6.5) * 0.22 - 0.18;
      rig.leftArmPivot.rotation.x *= 0.85;
      rig.leftArmPivot.rotation.z = 0;
      rig.headGroup.rotation.set(0.12 * bowCycle, 0, 0);
    } else if (greetingAnim === 'cheer') {
      // Energetic Athletic Cheer & Double-Bounce Greeting
      const bounce = Math.abs(Math.sin(elapsedTime * 5.2)) * 0.055;
      rig.bodyScaleGroup.position.y = bounce;
      rig.bodyScaleGroup.rotation.x *= 0.85;
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(
        rig.rightArmPivot.rotation.x,
        -2.55,
        0.18
      );
      rig.rightArmPivot.rotation.z = -0.3 + Math.sin(elapsedTime * 8.0) * 0.28;
      rig.leftArmPivot.rotation.x = THREE.MathUtils.lerp(
        rig.leftArmPivot.rotation.x,
        -0.75 + Math.cos(elapsedTime * 5.2) * 0.25,
        0.15
      );
      rig.leftArmPivot.rotation.z = 0.15;
      rig.headGroup.rotation.set(-0.06, 0, Math.sin(elapsedTime * 4.0) * 0.08);
    } else if (greetingAnim === 'nod') {
      // Respectful Teacher / Scholar Nod & Welcoming Hand Gesture
      rig.bodyScaleGroup.position.y = Math.sin(elapsedTime * 2.4) * 0.012;
      rig.bodyScaleGroup.rotation.x *= 0.85;
      rig.headGroup.rotation.set(
        Math.sin(elapsedTime * 4.2) * 0.14 + 0.06,
        Math.sin(elapsedTime * 1.8) * 0.06,
        0
      );
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(
        rig.rightArmPivot.rotation.x,
        -1.15,
        0.14
      );
      rig.rightArmPivot.rotation.z = -0.15 + Math.sin(elapsedTime * 3.8) * 0.1;
      rig.leftArmPivot.rotation.x *= 0.85;
      rig.leftArmPivot.rotation.z = 0;
    } else {
      // Friendly Overhead Hand Wave + Head Tilt ('wave')
      rig.bodyScaleGroup.position.y = Math.sin(elapsedTime * 3.0) * 0.018;
      rig.bodyScaleGroup.rotation.x *= 0.85;
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(
        rig.rightArmPivot.rotation.x,
        -2.4,
        0.18
      );
      rig.rightArmPivot.rotation.z = -0.28 + Math.sin(elapsedTime * 7.5) * 0.3;
      rig.leftArmPivot.rotation.x *= 0.85;
      rig.leftArmPivot.rotation.z = 0;
      rig.headGroup.rotation.set(0, 0, Math.sin(elapsedTime * 3.2) * 0.09);
    }
  } else if (activityIntent !== 'idle') {
    // Small, readable task gestures make scheduled object use visible without a full mocap rig.
    const cycle = Math.sin(elapsedTime * 2.1);
    if (activityIntent === 'sitting') {
      rig.leftLegPivot.rotation.x = THREE.MathUtils.lerp(rig.leftLegPivot.rotation.x, -1.05, 0.14);
      rig.rightLegPivot.rotation.x = THREE.MathUtils.lerp(rig.rightLegPivot.rotation.x, -1.05, 0.14);
    } else {
      rig.leftLegPivot.rotation.x *= 0.82;
      rig.rightLegPivot.rotation.x *= 0.82;
    }
    rig.bodyScaleGroup.position.y = activityIntent === 'sitting' ? -0.08 : Math.sin(elapsedTime * 1.8) * 0.008;
    rig.bodyScaleGroup.rotation.x = THREE.MathUtils.lerp(rig.bodyScaleGroup.rotation.x, activityIntent === 'reading' ? 0.08 : 0, 0.12);
    rig.headGroup.rotation.set(activityIntent === 'reading' ? 0.16 + cycle * 0.025 : 0, 0, cycle * 0.025);
    if (activityIntent === 'reading') {
      rig.leftArmPivot.rotation.x = THREE.MathUtils.lerp(rig.leftArmPivot.rotation.x, -0.92, 0.12);
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(rig.rightArmPivot.rotation.x, -0.92, 0.12);
      rig.leftArmPivot.rotation.z = 0.12;
      rig.rightArmPivot.rotation.z = -0.12;
    } else if (activityIntent === 'teaching') {
      rig.leftArmPivot.rotation.x = THREE.MathUtils.lerp(rig.leftArmPivot.rotation.x, -0.35, 0.12);
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(rig.rightArmPivot.rotation.x, -1.25 + cycle * 0.12, 0.12);
      rig.leftArmPivot.rotation.z = 0.08;
      rig.rightArmPivot.rotation.z = -0.18;
    } else {
      const workingMotion = activityIntent === 'sitting' ? -0.42 : -0.68;
      rig.leftArmPivot.rotation.x = THREE.MathUtils.lerp(rig.leftArmPivot.rotation.x, workingMotion + cycle * 0.08, 0.12);
      rig.rightArmPivot.rotation.x = THREE.MathUtils.lerp(rig.rightArmPivot.rotation.x, workingMotion - cycle * 0.08, 0.12);
      rig.leftArmPivot.rotation.z = 0.08;
      rig.rightArmPivot.rotation.z = -0.08;
    }
  } else {
    // Natural Breathing & Subtle Head Look-Around Idle
    const breath = Math.sin(elapsedTime * 2.4) * 0.014;
    rig.leftArmPivot.rotation.x *= 0.85;
    rig.leftArmPivot.rotation.z = THREE.MathUtils.lerp(
      rig.leftArmPivot.rotation.z,
      0.04 + Math.sin(elapsedTime * 1.6) * 0.025,
      0.1
    );
    rig.rightArmPivot.rotation.x *= 0.85;
    rig.rightArmPivot.rotation.z = THREE.MathUtils.lerp(
      rig.rightArmPivot.rotation.z,
      -0.04 - Math.sin(elapsedTime * 1.6) * 0.025,
      0.1
    );
    rig.leftLegPivot.rotation.x *= 0.85;
    rig.rightLegPivot.rotation.x *= 0.85;
    rig.bodyScaleGroup.position.y = breath;
    rig.bodyScaleGroup.rotation.x *= 0.85;
    rig.headGroup.rotation.x *= 0.85;
    rig.headGroup.rotation.z *= 0.85;
    rig.headGroup.rotation.y = Math.sin(elapsedTime * 1.1) * 0.09;
  }
}

/**
 * Builds the 3D Campus Notice Board landmark mesh at (4.8, 0, -5.8) without any floating triangle shape.
 */
export function createNoticeBoardLandmark(contactShadowMap: THREE.Texture): {
  root: THREE.Group;
  dispose: () => void;
} {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackG = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackM = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const frameMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.4,
    })
  );
  const corkMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.85,
      metalness: 0.05,
    })
  );
  const paperMat = trackM(
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.25,
      roughness: 0.6,
    })
  );

  // Contact shadow
  const shadowMat = trackM(
    new THREE.MeshBasicMaterial({
      map: contactShadowMap,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    })
  );
  const shadow = new THREE.Mesh(trackG(new THREE.PlaneGeometry(2.6, 1.4)), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  // Posts
  const postGeo = trackG(new THREE.BoxGeometry(0.12, 2.1, 0.12));
  for (const px of [-0.95, 0.95]) {
    const post = new THREE.Mesh(postGeo, frameMat);
    post.position.set(px, 1.05, 0);
    post.castShadow = true;
    root.add(post);
  }

  // Board Backing & Roof Hood
  const board = new THREE.Mesh(trackG(new THREE.BoxGeometry(1.8, 1.05, 0.1)), corkMat);
  board.position.set(0, 1.4, 0);
  board.castShadow = true;
  root.add(board);

  const hood = new THREE.Mesh(trackG(new THREE.BoxGeometry(2.15, 0.14, 0.45)), frameMat);
  hood.position.set(0, 2.02, 0);
  hood.castShadow = true;
  root.add(hood);

  // Pinned Flyer Notices
  const flyerGeo = trackG(new THREE.BoxGeometry(0.36, 0.44, 0.02));
  for (const fx of [-0.52, 0, 0.52]) {
    const flyer = new THREE.Mesh(flyerGeo, paperMat);
    flyer.position.set(fx, 1.42, 0.06);
    root.add(flyer);
  }

  return {
    root,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
