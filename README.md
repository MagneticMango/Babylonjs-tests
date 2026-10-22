A starter template for those who want to use the famous javascript 3D game engine babylonjs with typescript and webpack.

Customized from https://github.com/pandadelphin/babylonjs-typescript-webpack-starter

The included gltf model was made with photogrammetry using meshroom.

Physics is provided by the [Havok](https://doc.babylonjs.com/features/featuresDeepDive/physics/havokPlugin) plugin. The [Inspector](https://doc.babylonjs.com/toolsAndResources/inspectorv2/) is loaded on demand in development builds only.

## How to Start? ##

1. Download and Install Node.js (>= 22.15), or run `nix develop` to get a shell with Node.js and Chromium
2. Open Commandline and Enter
```
npm install
npm start
```
3. Open Browser and Enter [http://localhost:8080](http://localhost:8080)

## How to build? ##
```
npm run build
```

## Smoke test ##
With `npm start` running, inside `nix develop`:
```
node scripts/smoke.mjs http://localhost:8080/ shot.png
```
