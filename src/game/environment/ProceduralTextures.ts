import * as THREE from 'three';

export interface ProceduralTextureSet {
  courtyardTileColor: THREE.CanvasTexture;
  courtyardTileBump: THREE.CanvasTexture;
  academyFacadeColor: THREE.CanvasTexture;
  academyFacadeEmissive: THREE.CanvasTexture;
  roofSlateColor: THREE.CanvasTexture;
  roofSlateBump: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  disposeAll: () => void;
}

/**
 * Generates 100% zero-404 procedural CanvasTextures with calibrated colorSpace
 * (SRGBColorSpace for color maps, NoColorSpace for bump/roughness maps) and anisotropy.
 */
export function createProceduralTextureSet(maxAnisotropy: number): ProceduralTextureSet {
  const aniso = Math.max(1, Math.min(maxAnisotropy || 1, 8));

  // 1. Courtyard Paving Stone Tiles (Color + Bump)
  const tileColorCanvas = document.createElement('canvas');
  tileColorCanvas.width = 256;
  tileColorCanvas.height = 256;
  const tCtx = tileColorCanvas.getContext('2d')!;
  tCtx.fillStyle = '#384152';
  tCtx.fillRect(0, 0, 256, 256);

  const grid = 4;
  const cell = 256 / grid;
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const shade = ((x + y) % 2 === 0 ? 4 : -4) + (((x * 17 + y * 31) % 7) - 3);
      const r = 62 + shade;
      const g = 71 + shade;
      const b = 88 + shade;
      tCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      tCtx.fillRect(x * cell + 3, y * cell + 3, cell - 6, cell - 6);

      // Subtle bevel highlight
      tCtx.strokeStyle = 'rgba(203, 213, 225, 0.12)';
      tCtx.lineWidth = 1;
      tCtx.strokeRect(x * cell + 3.5, y * cell + 3.5, cell - 7, cell - 7);
    }
  }

  const courtyardTileColor = new THREE.CanvasTexture(tileColorCanvas);
  courtyardTileColor.colorSpace = THREE.SRGBColorSpace;
  courtyardTileColor.wrapS = THREE.RepeatWrapping;
  courtyardTileColor.wrapT = THREE.RepeatWrapping;
  courtyardTileColor.repeat.set(16, 16);
  courtyardTileColor.anisotropy = aniso;

  const tileBumpCanvas = document.createElement('canvas');
  tileBumpCanvas.width = 256;
  tileBumpCanvas.height = 256;
  const bCtx = tileBumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#303030';
  bCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      bCtx.fillStyle = '#d8d8d8';
      bCtx.fillRect(x * cell + 3, y * cell + 3, cell - 6, cell - 6);
    }
  }
  const courtyardTileBump = new THREE.CanvasTexture(tileBumpCanvas);
  courtyardTileBump.colorSpace = THREE.NoColorSpace;
  courtyardTileBump.wrapS = THREE.RepeatWrapping;
  courtyardTileBump.wrapT = THREE.RepeatWrapping;
  courtyardTileBump.repeat.set(16, 16);
  courtyardTileBump.anisotropy = aniso;

  // 2. Academy Architectural Facade & Classroom Windows (Color + Emissive)
  const facadeCanvas = document.createElement('canvas');
  facadeCanvas.width = 512;
  facadeCanvas.height = 256;
  const fCtx = facadeCanvas.getContext('2d')!;
  fCtx.fillStyle = '#e2e6ef';
  fCtx.fillRect(0, 0, 512, 256);

  // Horizontal floor bands (3 stories)
  const floors = 3;
  const cols = 8;
  const floorH = 256 / floors;
  const colW = 512 / cols;

  for (let fl = 0; fl < floors; fl++) {
    const fy = fl * floorH;
    // Architectural stringcourse trim
    fCtx.fillStyle = '#9aa5b8';
    fCtx.fillRect(0, fy, 512, 6);

    for (let c = 0; c < cols; c++) {
      const cx = c * colW;
      // Vertical pilaster
      fCtx.fillStyle = '#cdd4e2';
      fCtx.fillRect(cx, fy + 6, 6, floorH - 6);

      // Window frame
      const wx = cx + 12;
      const wy = fy + 16;
      const ww = colW - 20;
      const wh = floorH - 28;

      fCtx.fillStyle = '#253147';
      fCtx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);

      // Glass pane gradient
      const grad = fCtx.createLinearGradient(wx, wy, wx, wy + wh);
      grad.addColorStop(0, '#1e2c4a');
      grad.addColorStop(0.5, '#2d446e');
      grad.addColorStop(1, '#3b5787');
      fCtx.fillStyle = grad;
      fCtx.fillRect(wx, wy, ww, wh);

      // Mullion bars
      fCtx.fillStyle = '#1e293b';
      fCtx.fillRect(wx + ww / 2 - 1, wy, 2, wh);
      fCtx.fillRect(wx, wy + wh * 0.6, ww, 2);
    }
  }

  const academyFacadeColor = new THREE.CanvasTexture(facadeCanvas);
  academyFacadeColor.colorSpace = THREE.SRGBColorSpace;
  academyFacadeColor.wrapS = THREE.RepeatWrapping;
  academyFacadeColor.wrapT = THREE.ClampToEdgeWrapping;
  academyFacadeColor.anisotropy = aniso;

  // Emissive map for warm evening classroom windows
  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = 512;
  emissiveCanvas.height = 256;
  const eCtx = emissiveCanvas.getContext('2d')!;
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, 512, 256);

  for (let fl = 0; fl < floors; fl++) {
    const fy = fl * floorH;
    for (let c = 0; c < cols; c++) {
      const cx = c * colW;
      const wx = cx + 12;
      const wy = fy + 16;
      const ww = colW - 20;
      const wh = floorH - 28;

      // Deterministic lit classroom pattern
      const isLit = (fl * 5 + c * 3) % 3 !== 0;
      if (isLit) {
        eCtx.fillStyle = (fl + c) % 2 === 0 ? '#ffcf87' : '#ffe4b5';
        eCtx.fillRect(wx + 1, wy + 1, ww - 2, wh - 2);
        // Keep mullion bars dark
        eCtx.fillStyle = '#000000';
        eCtx.fillRect(wx + ww / 2 - 1, wy, 2, wh);
        eCtx.fillRect(wx, wy + wh * 0.6, ww, 2);
      }
    }
  }

  const academyFacadeEmissive = new THREE.CanvasTexture(emissiveCanvas);
  academyFacadeEmissive.colorSpace = THREE.SRGBColorSpace;
  academyFacadeEmissive.wrapS = THREE.RepeatWrapping;
  academyFacadeEmissive.wrapT = THREE.ClampToEdgeWrapping;
  academyFacadeEmissive.anisotropy = aniso;

  // 3. Roof Slate Tiles (Color + Bump)
  const roofCanvas = document.createElement('canvas');
  roofCanvas.width = 128;
  roofCanvas.height = 128;
  const rCtx = roofCanvas.getContext('2d')!;
  rCtx.fillStyle = '#1f293d';
  rCtx.fillRect(0, 0, 128, 128);
  for (let row = 0; row < 8; row++) {
    const ry = row * 16;
    rCtx.fillStyle = row % 2 === 0 ? '#243048' : '#1b2436';
    rCtx.fillRect(0, ry, 128, 14);
    for (let col = 0; col < 4; col++) {
      const offset = (row % 2) * 16;
      rCtx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
      rCtx.strokeRect((col * 32 + offset) % 128, ry, 32, 15);
    }
  }
  const roofSlateColor = new THREE.CanvasTexture(roofCanvas);
  roofSlateColor.colorSpace = THREE.SRGBColorSpace;
  roofSlateColor.wrapS = THREE.RepeatWrapping;
  roofSlateColor.wrapT = THREE.RepeatWrapping;
  roofSlateColor.repeat.set(8, 4);
  roofSlateColor.anisotropy = aniso;

  const roofSlateBump = new THREE.CanvasTexture(roofCanvas);
  roofSlateBump.colorSpace = THREE.NoColorSpace;
  roofSlateBump.wrapS = THREE.RepeatWrapping;
  roofSlateBump.wrapT = THREE.RepeatWrapping;
  roofSlateBump.repeat.set(8, 4);

  // 4. Radial Contact Shadow Disc Texture
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const radGrad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
  radGrad.addColorStop(0, 'rgba(5, 8, 18, 0.65)');
  radGrad.addColorStop(0.55, 'rgba(5, 8, 18, 0.28)');
  radGrad.addColorStop(1, 'rgba(5, 8, 18, 0)');
  sCtx.fillStyle = radGrad;
  sCtx.fillRect(0, 0, 128, 128);

  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);
  contactShadowMap.colorSpace = THREE.SRGBColorSpace;

  return {
    courtyardTileColor,
    courtyardTileBump,
    academyFacadeColor,
    academyFacadeEmissive,
    roofSlateColor,
    roofSlateBump,
    contactShadowMap,
    disposeAll: () => {
      courtyardTileColor.dispose();
      courtyardTileBump.dispose();
      academyFacadeColor.dispose();
      academyFacadeEmissive.dispose();
      roofSlateColor.dispose();
      roofSlateBump.dispose();
      contactShadowMap.dispose();
    },
  };
}
