/**
 * Character Controller
 * Handles 3D character model loading, animations, and parameter controls
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class CharacterController {
  constructor(modelPath, parentGroup) {
    this.modelPath = modelPath;
    this.parentGroup = parentGroup;
    
    this.model = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.clock = new THREE.Clock();
    
    // Parameters
    this.params = {
      scale: 1.0,
      rotation: 0,
      height: 0,
      animationSpeed: 1.0,
      colorTint: new THREE.Color(0xffffff),
      autoRotate: false
    };

    this.loader = new GLTFLoader();
  }

  /**
   * Load the character model
   */
  async load() {
    return new Promise((resolve, reject) => {
      this.loader.load(
        this.modelPath,
        (gltf) => {
          this.model = gltf.scene;
          
          // Initial setup
          this.model.position.set(0, this.params.height, 0);
          this.model.scale.setScalar(this.params.scale);
          this.model.rotation.y = (this.params.rotation * Math.PI) / 180;
          
          // Add to scene
          this.parentGroup.add(this.model);
          
          // Setup animations if available
          console.log('GLB loaded. Checking for animations...');
          console.log('gltf.animations:', gltf.animations);
          
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            
            gltf.animations.forEach((clip) => {
              const action = this.mixer.clipAction(clip);
              this.animations[clip.name] = action;
              console.log(`Animation found: "${clip.name}" (${clip.duration.toFixed(2)}s)`);
            });
            
            console.log('✅ Available animations:', Object.keys(this.animations));
          } else {
            console.warn('⚠️ No animations found in this GLB file');
          }
          
          // Apply color tint to materials
          this._applyColorTint(this.params.colorTint);
          
          resolve(this);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total * 100).toFixed(0);
          console.log(`Loading: ${percent}%`);
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Update the character (call every frame)
   */
  update(deltaTime) {
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Auto-rotate
    if (this.params.autoRotate && this.model) {
      this.model.rotation.y += deltaTime * 0.5;
    }
  }

  /**
   * Get list of available animation names
   */
  getAnimationNames() {
    return Object.keys(this.animations);
  }

  /**
   * Play an animation by name
   */
  playAnimation(animationName, fadeTime = 0.3) {
    console.log(`🎬 Playing animation: "${animationName}"`);
    
    if (!this.animations[animationName]) {
      console.warn(`❌ Animation "${animationName}" not found`);
      return;
    }

    if (!this.mixer) {
      console.warn('❌ Animation mixer not initialized');
      return;
    }

    const newAction = this.animations[animationName];

    if (this.currentAction && this.currentAction !== newAction) {
      console.log(`Fading out: ${this.currentAction.getClip().name}`);
      this.currentAction.fadeOut(fadeTime);
    }

    newAction
      .reset()
      .setEffectiveTimeScale(this.params.animationSpeed)
      .setEffectiveWeight(1)
      .fadeIn(fadeTime)
      .play();

    this.currentAction = newAction;
    console.log(`✅ Now playing: ${animationName}`);
  }

  /**
   * Stop current animation
   */
  stopAnimation() {
    if (this.currentAction) {
      this.currentAction.fadeOut(0.3);
      this.currentAction = null;
    }
  }

  /**
   * Set character scale
   */
  setScale(scale) {
    this.params.scale = scale;
    if (this.model) {
      this.model.scale.setScalar(scale);
    }
  }

  /**
   * Set character rotation (in degrees)
   */
  setRotation(degrees) {
    this.params.rotation = degrees;
    if (this.model && !this.params.autoRotate) {
      this.model.rotation.y = (degrees * Math.PI) / 180;
    }
  }

  /**
   * Set character height
   */
  setHeight(height) {
    this.params.height = height;
    if (this.model) {
      this.model.position.y = height;
    }
  }

  /**
   * Set animation speed
   */
  setAnimationSpeed(speed) {
    this.params.animationSpeed = speed;
    if (this.currentAction) {
      this.currentAction.setEffectiveTimeScale(speed);
    }
  }

  /**
   * Set color tint
   */
  setColorTint(color) {
    this.params.colorTint = new THREE.Color(color);
    this._applyColorTint(this.params.colorTint);
  }

  /**
   * Set auto-rotate
   */
  setAutoRotate(enabled) {
    this.params.autoRotate = enabled;
  }

  /**
   * Apply color tint to all materials
   * @private
   */
  _applyColorTint(color) {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.color.copy(color);
          });
        } else {
          child.material.color.copy(color);
        }
      }
    });
  }

  /**
   * Reset all parameters to defaults
   */
  resetParameters() {
    this.setScale(1.0);
    this.setRotation(0);
    this.setHeight(0);
    this.setAnimationSpeed(1.0);
    this.setColorTint(0xffffff);
    this.setAutoRotate(false);
  }

  /**
   * Get current parameters
   */
  getParameters() {
    return { ...this.params };
  }
}
