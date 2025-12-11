import { MindARThree } from 'mindar-image-three';

export class ARSystem {
  constructor() {
    this.mindarThree = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }

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
    if (!this.mindarThree) return;
    await this.mindarThree.start();
    // Don't set animation loop here - let main.js handle it
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
