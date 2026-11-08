# Imported Character Assets

Place the licensed Sketchfab source file at:

`public/models/Conejacolegiala_.glb`

The runtime loader in `src/game/entities/ImportedStudentRig.ts` loads this exact path and uses the embedded GLB materials and images. If the file is absent or fails to load, Aiko safely falls back to the existing procedural character.

The current source GLB has no glTF skin or animation clips. The runtime therefore applies a lightweight rigid-part articulation to the model's separate meshes. It is an integration prototype, not a substitute for artist-authored skin weights and a full humanoid deformation rig. Review the creator's license and redistribution terms before committing the model to this public repository.