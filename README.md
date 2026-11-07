# The School Chronicles — Phase 1 Foundation

**The School Chronicles** is a third-person, 3D open-world anime school-life simulation game set at **Seiran High Academy**.

This repository contains the **Phase 1 Foundation** build, establishing the modular project architecture, real-time 3D WebGL academy campus scene, main menu, loading pipeline, functional settings system, and IndexedDB save persistence for Web browsers and future Android (Capacitor) deployment.

---

## Technology Stack

- **Interface**: React 19 + TypeScript + Tailwind CSS v4
- **3D Rendering**: Three.js (`WebGLRenderer`, ACES Filmic Tone Mapping, `RoomEnvironment` PMREM reflections, `InstancedMesh` foliage/petals, procedural `CanvasTexture` PBR materials)
- **State Management**: Zustand (`useGameStore`)
- **Save Persistence**: IndexedDB (`the_school_chronicles_db`) with `localStorage` fallback
- **Audio**: Procedural Web Audio API sound synthesis (Japanese school bell chimes & UI feedback)
- **Build & Packaging**: Vite + Capacitor configuration (`capacitor.config.ts`)

---

## Project Structure

```text
├── public/
├── src/
│   ├── app/
│   │   └── ErrorBoundary.tsx         # Application-level error recovery
│   ├── components/
│   │   ├── loading/
│   │   │   └── LoadingScreen.tsx     # Real-progress initialization screen
│   │   ├── menu/
│   │   │   ├── MainMenu.tsx          # Anime school-game title screen & SVG crest
│   │   │   ├── NewGameModal.tsx      # Session start confirmation dialog
│   │   │   ├── SettingsModal.tsx     # Functional Graphics, Display, Audio, Camera, Controls
│   │   │   ├── CreditsModal.tsx      # Credits & Phase 2+ architecture registry overview
│   │   │   └── ExitModal.tsx         # Exit confirmation & session standby view
│   │   └── ui/
│   │       └── AcademyHUD.tsx        # Low-occlusion HUD & collapsible bottom camera/lighting dock
│   ├── config/
│   │   └── defaults.ts               # Default settings, viewpoints, atmosphere presets
│   ├── game/
│   │   ├── camera/
│   │   │   └── CameraController.ts   # Exponentially damped spline flyover & orbit camera
│   │   ├── core/
│   │   │   ├── rules.ts              # Pure deterministic preset, audio, and save validation logic
│   │   │   └── rules.test.ts         # Node built-in unit test suite
│   │   ├── environment/
│   │   │   ├── ProceduralTextures.ts # Zero-404 procedural CanvasTexture generator
│   │   │   └── AcademyModels.ts      # Multi-part 3D Seiran High Academy, clock tower, courtyard
│   │   ├── scene/
│   │   │   └── AcademyCanvas.tsx     # Isolated WebGL container & render loop
│   │   └── systems/
│   │       ├── AudioManager.ts       # Web Audio API synth manager
│   │       ├── SaveLoadManager.ts    # IndexedDB + LocalStorage save/settings persistence
│   │       └── ArchitectureRegistry.ts # Integration contracts for Phase 2+ gameplay systems
│   ├── store/
│   │   └── useGameStore.ts           # Centralized Zustand store
│   ├── types/
│   │   └── game.ts                   # Core TypeScript interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── capacitor.config.ts
├── vercel.json
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run unit tests**:
   ```bash
   npx --yes tsx --test src/game/core/rules.test.ts
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. Append `?autostart=1` to jump directly into the active 3D Academy Courtyard session.

4. **Create a production build**:
   ```bash
   npm run build
   ```
