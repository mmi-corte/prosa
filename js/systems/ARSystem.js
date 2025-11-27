import { MindARThree } from 'mindar-image-three';

export class ARSystem {
  constructor() {
    
    this.mindarThree = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }

  // Nouvelle méthode d'initialisation
  init(containerSelector, imageTargetSrc) {
    this.mindarThree = new MindARThree({
      container: document.querySelector(containerSelector),
      imageTargetSrc: imageTargetSrc
    });

    this.renderer = this.mindarThree.renderer;
    this.scene = this.mindarThree.scene;
    this.camera = this.mindarThree.camera;
  }

  async start() {
    if (!this.mindarThree) return; // Sécurité
    await this.mindarThree.start();
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    if (!this.mindarThree) return;
    this.mindarThree.stop();
    this.renderer.setAnimationLoop(null);
  }

  addAnchor(index) {
    return this.mindarThree.addAnchor(index);
  }
}