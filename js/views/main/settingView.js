import { gameContainer, settings, vibrate, applyLightMode } from "../../../app.js";
import { showBackButton } from "../components/backButton.js";

export function settingView() {
  const existingOverlay = document.getElementById('settingsOverlay')
  if (existingOverlay) {
    existingOverlay.remove()
  }

  showBackButton()

  const container = document.createElement('div')
  container.classList.add('modal-overlay')
  container.id = 'settingsOverlay'

  container.innerHTML = `
    <div class="settings-panel">

      <div class="setting-item">
        <label class="setting-label">Musique</label>
        <div class="slider-container">
          <input type="range" min="0" max="100" value="70" class="slider" id="musicSlider" />
        </div>
      </div>

      <div class="setting-item">
        <label class="setting-label">Effets sonores</label>
        <div class="slider-container">
          <input type="range" min="0" max="100" value="80" class="slider" id="sfxSlider" />
        </div>
      </div>


      <div class="setting-item">
        <label class="setting-label">Caméra</label>
        <button class="toggle-switch" id="cameraToggle">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="setting-item">
        <label class="setting-label">Mode clair</label>
        <button class="toggle-switch" id="lightModeToggle">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="setting-item">
        <label class="setting-label">Narration vocale</label>
        <button class="toggle-switch" id="narrationTtsToggle">
          <span class="toggle-knob"></span>
        </button>
      </div>
    </div>
    `

  gameContainer.appendChild(container)

  const musicSlider = document.getElementById('musicSlider')
  const sfxSlider = document.getElementById('sfxSlider')
  const cameraToggle = document.getElementById('cameraToggle')
  const lightModeToggle = document.getElementById('lightModeToggle')
  const narrationTtsToggle = document.getElementById('narrationTtsToggle')

  // Set initial values from settings
  musicSlider.value = settings.music || 70;
  sfxSlider.value = settings.sfx || 80;
  cameraToggle.classList.toggle('active', settings.camera);
  lightModeToggle.classList.toggle('active', settings.lightMode);
  narrationTtsToggle.classList.toggle('active', settings.narrationTts);

  //Musique
  musicSlider.addEventListener('input', (e) => {
    settings.music = parseInt(e.target.value);
  });
  //SFX
  sfxSlider.addEventListener('input', (e) => {
    settings.sfx = parseInt(e.target.value);
  });
  //Camera
  cameraToggle.addEventListener("click", () => toggleSetting(cameraToggle, "camera"))

  //Light Mode
  lightModeToggle.addEventListener("click", () => {
    toggleSetting(lightModeToggle, "lightMode")
    applyLightMode()
    // Sauvegarder immédiatement pour que le mode persiste
    localStorage.setItem('settingLightMode', settings.lightMode);
  })

  //Narration TTS
  narrationTtsToggle.addEventListener("click", () => {
    toggleSetting(narrationTtsToggle, "narrationTts")
    localStorage.setItem('settingNarrationTts', settings.narrationTts);
    // Cut any narration in progress when disabling
    if (!settings.narrationTts && typeof window.__prosaStopNarration === 'function') {
      window.__prosaStopNarration();
    }
  })

  function toggleSetting(toggle, key) {
    toggle.classList.toggle("active")
    settings[key] = toggle.classList.contains("active")
    vibrate(30)
  }

  function saveSettings() {
    localStorage.setItem('settingMusic', settings.music);
    localStorage.setItem('settingSfx', settings.sfx);
    localStorage.setItem('settingCamera', settings.camera);
    localStorage.setItem('settingLightMode', settings.lightMode);
    localStorage.setItem('settingNarrationTts', settings.narrationTts);
  }
}