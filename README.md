# The School Chronicles — 3D Academy Life Game

**The School Chronicles** is a third-person anime school-life game set around Seiran High Academy. It combines a procedural 3D campus, four playable homeroom spaces, NPC routines and conversations, story phases, school facilities, shops, transport and local save persistence.

The project is an actively developed game prototype. The automated checks cover TypeScript, deterministic game systems and the production build; device-level visual QA is still required before release.

## Current playable systems

- **Four homerooms:** Class A, Class B, Class C and Class D, each with student desks, seating and a teacher area.
- **Library:** browse, take, read and return books; book inventory is saved with the local game session.
- **Dormitory:** four furnished levels with elevator floor selection, resident beds, lockers and study desks.
- **Residential district:** four walk-in furnished houses with sofa, bedroom, desk and mailbox interactions.
- **Science laboratory:** three virtual lab benches and an observation log.
- **Computer laboratory:** six workstations with a safe demonstration terminal supporting `print("text")` and `print(number)`; it does not execute arbitrary code.
- **Auditorium:** stage, podium, audience seating and a presentation-rehearsal interaction.
- **Student council office:** meeting table, chairs, agenda board and archive cabinet.
- **Campus services:** medical room check-in, town manga shop and konbini purchases, aquatics deck, observatory, koi garden, festival stage, mountain shrine and sports court.
- **Railway:** four-car Hoshino Express with transparent passenger cabins, rotating wheels, moving rail travel, boarding and platform disembarking. The ride currently follows a bounded station corridor rather than a city-wide rail network.
- **NPC autonomy:** daily schedules, object-use targets, reading/teaching/work/practice activity states, simple hand-held props and relationship memory.
- **NPC voice:** manual Speak and opt-in Auto Voice controls use built-in browser speech synthesis. Voice availability and quality depend on the device's installed voices.
- **Mission progression:** sequential phase objectives, contextual clues and gated completion.
- **World interactions:** stable object IDs, proximity/facing checks, contextual prompts, cooldowns and an explicit enter/exit lifecycle.
- **World visibility management:** region-based visibility toggles with hysteresis.
- **Mobile graphics profile:** adaptive pixel ratio, shadow and particle budgets with frame-rate throttling.

## Controls

### Desktop
- **W / A / S / D:** move
- **Shift:** sprint
- **Space:** jump
- **E / F / Enter:** interact
- **Esc / P:** pause or close the active interaction
- **C:** switch camera mode

### Mobile
- On-screen joystick for movement.
- On-screen sprint, jump and interact controls.
- NPC Auto Voice can be enabled from the dialogue panel when browser speech synthesis is available.

## Technology

- React 19, TypeScript and Tailwind CSS v4
- Three.js for procedural 3D geometry, lighting, materials and rendering
- Zustand for game state
- IndexedDB with localStorage fallback for local saves
- Web Audio API for game audio
- Browser Speech Synthesis API for optional NPC voice
- Vite, Express and Capacitor configuration

## Project layout

```text
src/
  components/
    menu/                 # Main menu, settings and game flow
    ui/                   # Academy HUD, dialogue and interaction panels
  config/
    defaults.ts           # World data, interactables, colliders and settings
  game/
    camera/               # Follow and overview camera
    core/                 # Player physics, progression rules and tests
    entities/             # Procedural anime character rigs and props
    environment/          # Academy, expanded facilities and procedural assets
    scene/                # Three.js scene and simulation loop
    systems/              # NPC autonomy, world interactions, shops, books,
                          # transit, streaming, audio and save/load systems
  store/
    useGameStore.ts        # Zustand game state and actions
  types/
    game.ts                # Shared game types
api/
  npc-chat.ts              # NPC conversation endpoint
  story-director.ts        # Story generation endpoint
.github/workflows/
  verify.yml               # TypeScript, tests and production build
```

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. Use `?autostart=1` to skip the title flow during development.

Run the full automated test suite:

```bash
npm test
```

Run the TypeScript check and production build:

```bash
npm run lint
npm run build
```

## AI API configuration

Set these variables in Vercel Project Settings → Environment Variables:

- `GEMINI_API_KEY`: required for live Gemini-backed responses; local deterministic fallback responses are used when it is absent.
- `GEMINI_MODEL`: optional model override.

Keep API keys server-side. Never put keys in frontend code or commit them to Git. Redeploy after changing environment variables.

The serverless endpoints are `/api/npc-chat` and `/api/story-director`; the local Express server also exposes these routes.

## Verification

The GitHub Actions verification workflow runs:

1. `npm install`
2. `npm run lint` — TypeScript check
3. `npm test` — deterministic system tests
4. `npm run build` — Vite production build

## Known limitations and release checklist

- Dormitory floors are reached using the elevator interaction; continuous stair traversal and full multi-level navigation are not implemented.
- Region streaming currently toggles tagged scene groups by distance. It is not asynchronous asset streaming, occlusion culling or a full LOD system.
- NPC props and gestures are procedural and limited; there is no full skeletal hand attachment, motion capture or autonomous multi-agent simulation.
- NPC speech uses the browser/device voice engine, not recorded character voice acting. Some mobile browsers may have limited voice availability.
- The train ride is a moving passenger experience along the station corridor, not a full network with multiple stations and route schedules.
- Some interiors use simplified procedural geometry and need further art, collision and interaction polish.
- Save data is browser-local; there is no account-based cloud save or cross-device synchronization.
- API rate limiting is in-memory per serverless instance. Durable shared rate limiting and authenticated player sessions are required before a public launch.
- Automated CI does not replace manual browser testing, real Android-device testing, touch usability checks, thermal/battery profiling or end-to-end AI API testing.
- The current branch is not merged or production-deployed. Deployment should wait for a complete visual walkthrough and device QA.
