import { gameContainer, settings, vibrate, applyLightMode } from "../../../app.js";
import { updateMusicVolume, toggleMusicMute, isMusicMuted } from "../../musicManager.js";
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

      <button class="close-modal-btn" id="settingsCloseBtn" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="setting-item">
        <label class="setting-label">Musique</label>
        <button class="toggle-switch" id="musicMuteToggle">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="setting-item" id="musicSliderItem">
        <div class="slider-container">
          <input type="range" min="0" max="100" value="70" class="slider" id="musicSlider" />
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
        <label class="setting-label">Narration</label>
        <button class="toggle-switch" id="narrationTtsToggle">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div class="setting-item" id="narrationSliderItem">
        <div class="slider-container">
          <input type="range" min="0" max="100" value="80" class="slider" id="narrationSlider" />
        </div>
      </div>

      <div class="setting-item">
        <label class="setting-label">Son des touches</label>
        <button class="toggle-switch" id="typewriterSoundToggle">
          <span class="toggle-knob"></span>
        </button>
      </div>
    </div>
    `

  gameContainer.appendChild(container)

  document.getElementById('settingsCloseBtn').addEventListener('click', () => {
    saveSettings();
    container.remove();
  });

  const musicSlider = document.getElementById('musicSlider')
  const musicSliderItem = document.getElementById('musicSliderItem')
  const narrationSlider = document.getElementById('narrationSlider')
  const narrationSliderItem = document.getElementById('narrationSliderItem')
  const typewriterSoundToggle = document.getElementById('typewriterSoundToggle')
  const cameraToggle = document.getElementById('cameraToggle')
  const lightModeToggle = document.getElementById('lightModeToggle')
  const narrationTtsToggle = document.getElementById('narrationTtsToggle')
  const musicMuteToggle = document.getElementById('musicMuteToggle')

  // Set initial values from settings
  musicSlider.value = settings.music || 70;
  narrationSlider.value = settings.narration || 80;
  cameraToggle.classList.toggle('active', settings.camera);
  lightModeToggle.classList.toggle('active', settings.lightMode);
  narrationTtsToggle.classList.toggle('active', settings.narrationTts);
  musicMuteToggle.classList.toggle('active', !isMusicMuted());
  musicSliderItem.style.display = isMusicMuted() ? 'none' : '';
  narrationSliderItem.style.display = settings.narrationTts ? '' : 'none';
  typewriterSoundToggle.classList.toggle('active', settings.typewriterSound);

  //Musique
  musicSlider.addEventListener('input', (e) => {
    settings.music = parseInt(e.target.value);
    updateMusicVolume();
  });
  //Narration
  narrationSlider.addEventListener('input', (e) => {
    settings.narration = parseInt(e.target.value);
  });
  //Mute musique
  musicMuteToggle.addEventListener('click', () => {
    const nowMuted = toggleMusicMute();
    musicMuteToggle.classList.toggle('active', !nowMuted);
    musicSliderItem.style.display = nowMuted ? 'none' : '';
    vibrate(30);
  });

  //Son touches typewriter
  typewriterSoundToggle.addEventListener('click', () => {
    toggleSetting(typewriterSoundToggle, 'typewriterSound');
    localStorage.setItem('settingTypewriterSound', settings.typewriterSound);
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
    settings.narrationTts = !settings.narrationTts;
    narrationTtsToggle.classList.toggle('active', settings.narrationTts);
    narrationSliderItem.style.display = settings.narrationTts ? '' : 'none';
    localStorage.setItem('settingNarrationTts', settings.narrationTts);
    if (!settings.narrationTts && typeof window.__prosaStopNarration === 'function') {
      window.__prosaStopNarration();
    }
    vibrate(30);
  })

  function toggleSetting(toggle, key) {
    toggle.classList.toggle("active")
    settings[key] = toggle.classList.contains("active")
    vibrate(30)
  }

  function saveSettings() {
    localStorage.setItem('settingMusic', settings.music);
    localStorage.setItem('settingNarration', settings.narration);
    localStorage.setItem('settingCamera', settings.camera);
    localStorage.setItem('settingLightMode', settings.lightMode);
    localStorage.setItem('settingNarrationTts', settings.narrationTts);
  }
}