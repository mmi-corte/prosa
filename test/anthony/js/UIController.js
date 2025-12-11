/**
 * UI Controller
 * Manages all UI interactions and binds them to the character controller
 */

export class UIController {
  constructor(characterController, arSystem) {
    this.character = characterController;
    this.arSystem = arSystem;
    this.isARRunning = false;
  }

  /**
   * Initialize UI event listeners
   */
  init() {
    this._setupARControls();
    this._setupPanelToggle();
    this._setupAnimationControls();
    this._setupParameterControls();
    this._populateAnimationSelect();
  }

  /**
   * Setup AR start/stop controls
   * @private
   */
  _setupARControls() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    startButton.addEventListener('click', async () => {
      if (!this.isARRunning) {
        this._updateStatus('Starting AR...');
        await this.arSystem.start();
        this.isARRunning = true;
        this._updateStatus('AR Active - Point camera at marker');
        startButton.disabled = true;
        stopButton.disabled = false;
      }
    });

    stopButton.addEventListener('click', () => {
      if (this.isARRunning) {
        this.arSystem.stop();
        this.isARRunning = false;
        this._updateStatus('AR Stopped');
        startButton.disabled = false;
        stopButton.disabled = true;
      }
    });

    stopButton.disabled = true;
  }

  /**
   * Setup panel collapse/expand toggle
   * @private
   */
  _setupPanelToggle() {
    const panelHeader = document.querySelector('.panel-header');
    const panelContent = document.getElementById('panel-content');
    const toggleBtn = document.getElementById('togglePanel');

    panelHeader.addEventListener('click', () => {
      const isCollapsed = panelContent.classList.toggle('hidden');
      panelHeader.classList.toggle('collapsed', isCollapsed);
      toggleBtn.textContent = isCollapsed ? '◀' : '▼';
    });
  }

  /**
   * Populate animation dropdown with available animations
   * @private
   */
  _populateAnimationSelect() {
    const select = document.getElementById('animationSelect');
    const animationNames = this.character.getAnimationNames();

    // Clear existing options except the first
    select.innerHTML = '<option value="">Select Animation...</option>';

    if (animationNames.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '(No animations in model)';
      option.disabled = true;
      select.appendChild(option);
      console.warn('No animations found in character model');
    } else {
      animationNames.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
      });
      console.log(`Loaded ${animationNames.length} animations into dropdown`);
    }
  }

  /**
   * Setup animation controls
   * @private
   */
  _setupAnimationControls() {
    const select = document.getElementById('animationSelect');
    const playButton = document.getElementById('playAnimation');

    playButton.addEventListener('click', () => {
      const selectedAnimation = select.value;
      if (selectedAnimation) {
        this.character.playAnimation(selectedAnimation);
        this._updateStatus(`Playing: ${selectedAnimation}`);
      }
    });

    // Also play on select change
    select.addEventListener('change', () => {
      const selectedAnimation = select.value;
      if (selectedAnimation) {
        this.character.playAnimation(selectedAnimation);
        this._updateStatus(`Playing: ${selectedAnimation}`);
      }
    });
  }

  /**
   * Setup parameter controls (sliders, color picker, etc.)
   * @private
   */
  _setupParameterControls() {
    // Scale slider
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    scaleSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.character.setScale(value);
      scaleValue.textContent = value.toFixed(1);
    });

    // Rotation slider
    const rotationSlider = document.getElementById('rotationSlider');
    const rotationValue = document.getElementById('rotationValue');
    rotationSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.character.setRotation(value);
      rotationValue.textContent = `${value}°`;
    });

    // Height slider
    const heightSlider = document.getElementById('heightSlider');
    const heightValue = document.getElementById('heightValue');
    heightSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.character.setHeight(value);
      heightValue.textContent = value.toFixed(2);
    });

    // Animation speed slider
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    speedSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.character.setAnimationSpeed(value);
      speedValue.textContent = `${value.toFixed(1)}x`;
    });

    // Color picker
    const colorPicker = document.getElementById('colorPicker');
    const resetColor = document.getElementById('resetColor');
    
    colorPicker.addEventListener('input', (e) => {
      this.character.setColorTint(e.target.value);
    });

    resetColor.addEventListener('click', () => {
      colorPicker.value = '#ffffff';
      this.character.setColorTint('#ffffff');
    });

    // Auto-rotate checkbox
    const autoRotate = document.getElementById('autoRotate');
    autoRotate.addEventListener('change', (e) => {
      this.character.setAutoRotate(e.target.checked);
      rotationSlider.disabled = e.target.checked;
    });

    // Reset all button
    const resetAll = document.getElementById('resetAll');
    resetAll.addEventListener('click', () => {
      this.character.resetParameters();
      this._resetUIValues();
      this._updateStatus('Parameters reset');
    });
  }

  /**
   * Reset UI values to defaults
   * @private
   */
  _resetUIValues() {
    document.getElementById('scaleSlider').value = 1.0;
    document.getElementById('scaleValue').textContent = '1.0';
    
    document.getElementById('rotationSlider').value = 0;
    document.getElementById('rotationValue').textContent = '0°';
    
    document.getElementById('heightSlider').value = 0;
    document.getElementById('heightValue').textContent = '0.0';
    
    document.getElementById('speedSlider').value = 1.0;
    document.getElementById('speedValue').textContent = '1.0x';
    
    document.getElementById('colorPicker').value = '#ffffff';
    
    document.getElementById('autoRotate').checked = false;
    document.getElementById('rotationSlider').disabled = false;
  }

  /**
   * Update status message
   * @private
   */
  _updateStatus(message) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
      statusText.textContent = message;
    }
  }
}
