import { gameContainer, settings, vibrate } from "../../../app.js";

export function settingView() {
    const container = document.createElement('div')
    container.classList.add('modal-overlay')

    container.innerHTML = `
    <div class="settings-panel">
      <button class="close-modal-btn" id="closeModal" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </button>

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
    </div>
    `

    gameContainer.appendChild(container)

    const musicSlider = document.getElementById('musicSlider')
    const sfxSlider = document.getElementById('sfxSlider')
    const cameraToggle = document.getElementById('cameraToggle')

    // Set initial values from settings
    musicSlider.value = settings.music || 70;
    sfxSlider.value = settings.sfx || 80;
    cameraToggle.classList.toggle('active', settings.camera);

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

    function toggleSetting(toggle, key) {
        toggle.classList.toggle("active")
        settings[key] = toggle.classList.contains("active")
        vibrate(30)
    }

    const closeModal = document.getElementById('closeModal')
    closeModal.addEventListener('click', () => {
        saveSettings()
        window.history.back();
        container.remove()
    })

    function saveSettings() {
        localStorage.setItem('settingMusic', settings.music);
        localStorage.setItem('settingSfx', settings.sfx);
        localStorage.setItem('settingCamera', settings.camera);
    }
}