import { MindARThree } from 'mindar-image-three';

export class ARSystem {
  constructor(containerSelector, imageTargetSrc) {
    this.mindarThree = new MindARThree({
      container: document.querySelector(containerSelector),
      imageTargetSrc: imageTargetSrc
    });
    
    // On expose les éléments utiles pour l'extérieur
    this.renderer = this.mindarThree.renderer;
    this.scene = this.mindarThree.scene;
    this.camera = this.mindarThree.camera;
  }

  async start() {
    await this.mindarThree.start();
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.mindarThree.stop();
    this.renderer.setAnimationLoop(null);
  }

  // Méthode pour ajouter des ancres facilement
  addAnchor(index) {
    return this.mindarThree.addAnchor(index);
  }
}