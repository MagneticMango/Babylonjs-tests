import { SetMissingSideEffectWarningsEnabled } from '@babylonjs/core/Misc/devTools';
import { Project } from './project';

// Warn in the console when a deep import misses a side-effect import Babylon needs
if (process.env.NODE_ENV !== 'production') {
  SetMissingSideEffectWarningsEnabled(true);
}

window.addEventListener('DOMContentLoaded', async () => {
  let project = new Project('renderCanvas');
  await project.createScene();
  project.animate();
});
