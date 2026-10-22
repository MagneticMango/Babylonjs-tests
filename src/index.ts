import { Project } from './project';

window.addEventListener('DOMContentLoaded', async () => {
  let project = new Project('renderCanvas');
  await project.createScene();
  project.animate();
});
