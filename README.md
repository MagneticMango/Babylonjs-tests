# Babylon.js TypeScript Webpack Starter

A starter template for those who want to use the famous JavaScript 3D game engine [Babylon.js](https://www.babylonjs.com/) with TypeScript and webpack.

Customized from https://github.com/pandadelphin/babylonjs-typescript-webpack-starter

The included glTF model was made with photogrammetry using [Meshroom](https://alicevision.org/#meshroom).

## What's inside ##

- **Babylon.js 9** with deep (tree-shakeable) imports
- **Havok physics** via [`@babylonjs/havok`](https://doc.babylonjs.com/features/featuresDeepDive/physics/havokPlugin); the ground is a static collider
- **Inspector v2**, loaded on demand in development builds only
- **TypeScript 6** in strict mode, **webpack 5** with dev server and hot reload
- A demo scene: orbit camera, default environment (skybox and ground) and the photogrammetry model

## Requirements ##

- [Node.js](https://nodejs.org/) 22.15 or newer, or
- [Nix](https://nixos.org/) with flakes: `nix develop` opens a shell with Node.js 24 and Chromium

## Getting started ##

```
npm install
npm start
```

The dev server opens [http://localhost:8080](http://localhost:8080) and reloads on changes.

## Scripts ##

| Command | Description |
|---|---|
| `npm start` | Development server with hot reload and the Inspector |
| `npm run build` | Production build into `dist/` (no Inspector, external source maps) |
| `npm run typecheck` | Type-check the sources without emitting files |

## Project structure ##

```
src/
  index.ts      entry point, starts the project once the page has loaded
  project.ts    scene setup: engine, camera, light, environment, physics, model
  index.ejs     HTML template with the render canvas
  env.d.ts      type for process.env.NODE_ENV, which webpack replaces at build time
  assets/       copied to dist/assets (model and textures)
scripts/
  smoke.mjs     headless Chromium smoke test
```

## Importing from Babylon.js ##

The project imports each class from its own module instead of the `@babylonjs/core` index. This keeps the vendor bundle at about 2.6 MB instead of 7 MB:

```ts
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
```

Some features are added to existing classes by a separate import that is only needed for its side effect, e.g. `scene.createDefaultEnvironment()` needs `import '@babylonjs/core/Helpers/sceneHelpers'`. Development builds log a console warning when such an import is missing:

```
[Babylon.js] Scene.enablePhysics() requires a side-effect import.
```

See the Babylon.js docs on [tree shaking](https://doc.babylonjs.com/setup/treeshaking).

## Physics ##

Physics is enabled in `createScene()` once the Havok wasm module has loaded; webpack emits the `.wasm` file automatically. To add a dynamic body:

```ts
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';

const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.5 }, scene);
ball.position.y = 3;
new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
```

## Smoke test ##

`scripts/smoke.mjs` loads the page in headless Chromium, prints console messages, errors and failed requests, and saves a screenshot. With `npm start` running, inside `nix develop`:

```
node scripts/smoke.mjs http://localhost:8080/ shot.png
```

## License ##

[MIT](LICENSE)
