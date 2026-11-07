# The School Chronicles — 3D School-Life Game Prototype

**The School Chronicles** is a third-person, 3D open-world anime school-life simulation game set at **Seiran High Academy**.

This repository contains an evolving playable prototype: a procedural Three.js academy campus, character creation, story library and phase selection, NPC proximity conversations, Gemini-backed story/chat API routes, local save persistence, and mobile-oriented controls. Several systems remain prototypes; see the status and limitations below.

---

## Technology Stack

- **Interface**: React 19 + TypeScript + Tailwind CSS v4
- **3D Rendering**: Three.js (`WebGLRenderer`, ACES Filmic Tone Mapping, `RoomEnvironment` PMREM reflections, `InstancedMesh` foliage/petals, procedural `CanvasTexture` PBR materials)
- **State Management**: Zustand (`useGameStore`)
- **Save Persistence**: IndexedDB (`the_school_chronicles_db`) with `localStorage` fallback
- **Audio**: Procedural Web Audio API effects, plus optional browser speech synthesis for NPC replies
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
├── api/\n│   ├── npc-chat.ts                  # Vercel serverless NPC conversation endpoint\n│   └── story-director.ts             # Vercel serverless story generation endpoint\n├── .github/workflows/verify.yml     # TypeScript, unit test and production build CI\n├── server.ts                        # Local Express + Vite development server\n├── capacitor.config.ts
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


## AI API configuration

Set the following variables in Vercel Project Settings → Environment Variables:

- `GEMINI_API_KEY`: Google AI Studio API key (required for live Gemini responses; without it, deterministic/local fallback responses are used).
- `GEMINI_MODEL`: optional model override. The current default is `gemini-3.8-flash`.

Never place API keys in frontend code, commit them to Git, or send them in chat. Redeploy after changing environment variables.

The Vercel functions are exposed at `/api/npc-chat` and `/api/story-director`. The local Express development server also exposes these routes.

## Verification

GitHub Actions runs:

1. `npm install`
2. `npm run lint` (TypeScript check)
3. `npm test` (core deterministic logic tests)
4. `npm run build` (Vite production build)

## Current limitations

- Saves are browser-local (IndexedDB/localStorage); there is no account-based cloud save or cross-device sync.
- The API rate limits are in-memory per serverless instance. Add durable shared rate limiting and authenticated player sessions before a public launch.
- NPC voice uses the device/browser's built-in speech synthesis and depends on available system voices; it is not studio-quality voice acting.
- NPC movement and relationships are game-side simulations, not a fully autonomous multi-agent world.
- Some campus buildings and interiors are procedural geometry and still need detailed room layouts, furniture interactions, and playtesting.
- Story phase unlocks are sequential and duplicate rewards are blocked, but objective-by-objective mission verification is still being expanded.
- CI confirms type checking, core tests, and the Vite build; it does not replace live browser, mobile-device, or end-to-end Gemini testing.
