import { gameContainer, settings, vibrate } from "../../../app.js";

export function settingView() {
    const container = document.createElement('div')
    container.classList.add('modal-overlay')

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
    </div>
    `

    gameContainer.appendChild(container)

    const musicSlider = document.getElementById('musicSlider')
    const sfxSlider = document.getElementById('sfxSlider')
    const cameraToggle = document.getElementById('cameraToggle')
    const lightModeToggle = document.getElementById('lightModeToggle')

    // Set initial values from settings
    musicSlider.value = settings.music || 70;
    sfxSlider.value = settings.sfx || 80;
    cameraToggle.classList.toggle('active', settings.camera);
    lightModeToggle.classList.toggle('active', settings.lightMode);

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
        document.body.classList.toggle('light-mode', settings.lightMode)
    })

    function toggleSetting(toggle, key) {
        toggle.classList.toggle("active")
        settings[key] = toggle.classList.contains("active")
        vibrate(30)
    }

    // Bouton retour
    const backButton = document.createElement('button')
    backButton.classList.add('back-btn-circle')
    backButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `
    backButton.addEventListener('click', () => {
        saveSettings()
        container.remove()
    })
    container.appendChild(backButton)

    function saveSettings() {
        localStorage.setItem('settingMusic', settings.music);
        localStorage.setItem('settingSfx', settings.sfx);
        localStorage.setItem('settingCamera', settings.camera);
        localStorage.setItem('settingLightMode', settings.lightMode);
    }
}