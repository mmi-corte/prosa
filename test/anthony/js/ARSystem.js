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
      imageTargetSrc: imageTargetSrc,
      // Quality improvements
      filterMinCF: 0.0001,        // Smooth tracking
      filterBeta: 0.001,          // Reduce jitter
      maxTrack: 1,                 // Track only one marker
      warmupTolerance: 5,          // Faster initial detection
      missTolerance: 5          // Keep tracking longer when marker lost
    });

    this.renderer = this.mindarThree.renderer;
    this.scene = this.mindarThree.scene;
    this.camera = this.mindarThree.camera;
    
    // Enable antialiasing for smoother rendering
    this.renderer.setPixelRatio(window.devicePixelRatio);
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
