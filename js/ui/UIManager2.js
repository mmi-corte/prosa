/**
 * UIManager - Gestionnaire d'interface post-apocalyptique pour PROSA
 * Génère dynamiquement l'écran de chargement et les contrôles
 */
export class UIManager {
    constructor(rootElementId) {
      this.root = document.getElementById(rootElementId)
      this.loadingScreen = null
      this.controlPanel = null
      this.intervals = []
      this.progress = 0
      this.checkIndex = 0
  
      // Configuration
      this.config = {
        dustParticleCount: 30,
        baseRadiation: 387,
        radiationFluctuation: 50,
        progressSpeed: 120,
        statusMessages: [
          "Initialisation des systèmes vitaux...",
          "Scan environnemental en cours...",
          "Connexion aux réseaux de survivants...",
          "Chargement des données mythologiques...",
        ],
        environmentData: {
          temp: 47,
          oxygen: 18,
          pressure: 0.89,
        },
      }
    }
  
    /**
     * Initialise l'UI Manager
     */
    init() {
      this.createLoadingScreen()
      this.createControlPanel()
      this.startAnimations()
      this.startProgress()
    }
  
    /**
     * Crée un élément DOM avec classes et attributs
     */
    createElement(tag, classes = [], attributes = {}, innerHTML = "") {
      const el = document.createElement(tag)
      if (classes.length) el.className = classes.join(" ")
      Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value))
      if (innerHTML) el.innerHTML = innerHTML
      return el
    }
  
    /**
     * Génère l'écran de chargement complet
     */
    createLoadingScreen() {
      this.loadingScreen = this.createElement("div", [], { id: "loading-screen" })
  
      // Effets CRT
      this.loadingScreen.appendChild(this.createElement("div", ["crt-overlay"]))
      this.loadingScreen.appendChild(this.createElement("div", ["scanlines"]))
      this.loadingScreen.appendChild(this.createElement("div", ["screen-flicker"]))
      this.loadingScreen.appendChild(this.createElement("div", ["vignette"]))
  
      // Particules de poussière
      this.loadingScreen.appendChild(this.createDustContainer())
  
      // Cadre terminal
      this.loadingScreen.appendChild(this.createTerminalFrame())
  
      // Header
      this.loadingScreen.appendChild(this.createTerminalHeader())
  
      // Contenu principal
      this.loadingScreen.appendChild(this.createLoadingContent())
  
      // Footer
      this.loadingScreen.appendChild(this.createTerminalFooter())
  
      // Static noise
      this.loadingScreen.appendChild(this.createElement("div", ["static-noise"]))
  
      this.root.appendChild(this.loadingScreen)
    }
  
    /**
     * Crée le conteneur de particules de poussière
     */
    createDustContainer() {
      const container = this.createElement("div", ["dust-container"])
      for (let i = 0; i < this.config.dustParticleCount; i++) {
        container.appendChild(this.createElement("div", ["dust"]))
      }
      return container
    }
  
    /**
     * Crée le cadre du terminal avec effet rouille
     */
    createTerminalFrame() {
      const frame = this.createElement("div", ["terminal-frame"])
  
      // Coins
      ;["tl", "tr", "bl", "br"].forEach((corner) => {
        frame.appendChild(this.createElement("div", ["frame-corner", `corner-${corner}`]))
      })
  
      // Taches de rouille
      ;[1, 2, 3].forEach((i) => {
        frame.appendChild(this.createElement("div", ["frame-rust", `rust-${i}`]))
      })
  
      return frame
    }
  
    /**
     * Crée le header du terminal
     */
    createTerminalHeader() {
      const header = this.createElement("div", ["terminal-header"])
  
      // Partie gauche
      const headerLeft = this.createElement("div", ["header-left"])
      headerLeft.appendChild(this.createElement("span", ["blink-dot", "danger"]))
      headerLeft.appendChild(this.createElement("span", ["header-text"], {}, "BUNKER-07 // SYSTÈME DE SURVIE"))
  
      // Partie droite
      const headerRight = this.createElement("div", ["header-right"])
      headerRight.appendChild(this.createElement("span", ["radiation-icon"], {}, "☢"))
  
      const radLevel = this.createElement("span", ["radiation-level"])
      radLevel.innerHTML = `RADIATION: <span id="rad-level">${this.config.baseRadiation}</span> mSv`
      headerRight.appendChild(radLevel)
  
      header.appendChild(headerLeft)
      header.appendChild(headerRight)
  
      return header
    }
  
    /**
     * Crée le contenu principal du loading
     */
    createLoadingContent() {
      const content = this.createElement("div", ["loading-content"])
  
      // Logo container
      content.appendChild(this.createLogoContainer())
  
      // Compteur Geiger
      content.appendChild(this.createGeigerCounter())
  
      // Statut système
      content.appendChild(this.createSystemStatus())
  
      // Barre de progression
      content.appendChild(this.createProgressContainer())
  
      // Alerte
      content.appendChild(this.createAlertBox())
  
      return content
    }
  
    /**
     * Crée le logo PROSA avec effets glitch
     */
    createLogoContainer() {
      const container = this.createElement("div", ["logo-container"])
  
      container.appendChild(this.createElement("div", ["warning-stripes"]))
  
      const title = this.createElement("h1", ["game-title", "glitch-text"], { "data-text": "PROSA" }, "PROSA")
      container.appendChild(title)
  
      const subtitle = this.createElement("div", ["subtitle-terminal"])
      subtitle.appendChild(
        this.createElement("span", ["typing-text"], {}, "[ PROTOCOLE DE RENAISSANCE OPÉRATIONNEL - SECTEUR ALPHA ]"),
      )
      container.appendChild(subtitle)
  
      return container
    }
  
    /**
     * Crée le compteur Geiger animé
     */
    createGeigerCounter() {
      const counter = this.createElement("div", ["geiger-counter"])
  
      // Display
      const display = this.createElement("div", ["geiger-display"])
      display.appendChild(this.createElement("div", ["geiger-needle"]))
  
      const scale = this.createElement("div", ["geiger-scale"])
      ;["0", "100", "500", "1K", "FATAL"].forEach((val) => {
        scale.appendChild(this.createElement("span", [], {}, val))
      })
      display.appendChild(scale)
  
      // Clicks
      const clicks = this.createElement("div", ["geiger-clicks"])
      for (let i = 0; i < 5; i++) {
        clicks.appendChild(this.createElement("span", ["click"]))
      }
  
      counter.appendChild(display)
      counter.appendChild(clicks)
  
      return counter
    }
  
    /**
     * Crée la zone de statut système
     */
    createSystemStatus() {
      const status = this.createElement("div", ["system-status"])
  
      this.config.statusMessages.forEach((message, index) => {
        const line = this.createElement("div", ["status-line"])
        line.appendChild(this.createElement("span", ["status-icon"], {}, "▸"))
        line.appendChild(this.createElement("span", ["status-text"], { id: `status-${index + 1}` }, message))
        line.appendChild(this.createElement("span", ["status-check"], { id: `check-${index + 1}` }))
        status.appendChild(line)
      })
  
      return status
    }
  
    /**
     * Crée la barre de progression
     */
    createProgressContainer() {
      const container = this.createElement("div", ["progress-container"])
  
      // Label
      const label = this.createElement("div", ["progress-label"])
      label.appendChild(this.createElement("span", [], {}, "CHARGEMENT DU PROTOCOLE"))
      label.appendChild(this.createElement("span", ["progress-percent"], {}, "0%"))
      container.appendChild(label)
  
      // Barre
      const bar = this.createElement("div", ["progress-bar"])
      bar.appendChild(this.createElement("div", ["progress-fill"]))
  
      const segments = this.createElement("div", ["progress-segments"])
      for (let i = 0; i < 10; i++) {
        segments.appendChild(this.createElement("span"))
      }
      bar.appendChild(segments)
      container.appendChild(bar)
  
      // ASCII
      const ascii = this.createElement("div", ["progress-ascii"])
      ascii.innerHTML = '[<span class="ascii-fill"></span><span class="ascii-empty">░░░░░░░░░░░░░░░░░░░░</span>]'
      container.appendChild(ascii)
  
      return container
    }
  
    /**
     * Crée la boîte d'alerte
     */
    createAlertBox() {
      const alert = this.createElement("div", ["alert-box"])
  
      alert.appendChild(this.createElement("div", ["alert-icon"], {}, "⚠"))
  
      const text = this.createElement("div", ["alert-text"])
      text.appendChild(this.createElement("span", ["alert-title"], {}, "ATTENTION"))
      text.appendChild(
        this.createElement(
          "span",
          ["alert-message"],
          {},
          "Zone contaminée détectée. Les anciens mythes se réveillent dans les ruines.",
        ),
      )
      alert.appendChild(text)
  
      return alert
    }
  
    /**
     * Crée le footer du terminal
     */
    createTerminalFooter() {
      const footer = this.createElement("div", ["terminal-footer"])
  
      // Stats
      const stats = this.createElement("div", ["footer-stats"])
      const { temp, oxygen, pressure } = this.config.environmentData
      stats.innerHTML = `
        <span>TEMP: ${temp}°C</span>
        <span>|</span>
        <span>O2: ${oxygen}%</span>
        <span>|</span>
        <span>PRESSION: ${pressure} atm</span>
        <span>|</span>
        <span class="blink">ALERTE NIVEAU 3</span>
      `
  
      // Temps
      const time = this.createElement("div", ["footer-time"])
      time.appendChild(this.createElement("span", [], { id: "terminal-date" }, "2147.03.15"))
      time.appendChild(this.createElement("span", [], { id: "terminal-time" }, "--:--:--"))
  
      footer.appendChild(stats)
      footer.appendChild(time)
  
      return footer
    }
  
    /**
     * Crée le panneau de contrôle
     */
    createControlPanel() {
      this.controlPanel = this.createElement("div", ["hidden"], { id: "control" })
  
      // Effets CRT
      this.controlPanel.appendChild(this.createElement("div", ["crt-overlay"]))
      this.controlPanel.appendChild(this.createElement("div", ["scanlines"]))
      this.controlPanel.appendChild(this.createElement("div", ["vignette"]))
  
      // Terminal de contrôle
      const terminal = this.createElement("div", ["control-terminal"])
  
      // Header
      const header = this.createElement("div", ["control-header"])
      header.appendChild(this.createElement("span", ["blink-dot", "success"]))
      header.appendChild(this.createElement("span", [], {}, "SYSTÈME OPÉRATIONNEL // PRÊT"))
      terminal.appendChild(header)
  
      // Container boutons
      const container = this.createElement("div", ["control-container"])
  
      // Bouton Start
      const startBtn = this.createElement("button", ["terminal-button", "start-btn"], { id: "startButton" })
      startBtn.innerHTML = `
        <span class="btn-bracket">[</span>
        <span class="btn-icon">▶</span>
        <span class="btn-text">LANCEMENT DU SCAN</span>
        <span class="btn-bracket">]</span>
      `
      container.appendChild(startBtn)
  
      // Bouton Stop
      const stopBtn = this.createElement("button", ["terminal-button", "stop-btn"], { id: "stopButton" })
      stopBtn.innerHTML = `
        <span class="btn-bracket">[</span>
        <span class="btn-icon">■</span>
        <span class="btn-text">ARRÊT D'URGENCE</span>
        <span class="btn-bracket">]</span>
      `
      container.appendChild(stopBtn)
  
      terminal.appendChild(container)
  
      // Footer
      const footer = this.createElement("div", ["control-footer"])
      footer.innerHTML = `
        <span class="typing-cursor">_</span>
        <span>En attente de commande opérateur...</span>
      `
      terminal.appendChild(footer)
  
      this.controlPanel.appendChild(terminal)
      this.root.appendChild(this.controlPanel)
    }
  
    /**
     * Démarre toutes les animations
     */
    startAnimations() {
      this.startTimeUpdate()
      this.startRadiationFluctuation()
      this.startGeigerClicks()
      this.startRandomGlitch()
    }
  
    /**
     * Met à jour l'heure du terminal
     */
    startTimeUpdate() {
      const updateTime = () => {
        const terminalTime = document.getElementById("terminal-time")
        if (!terminalTime) return
  
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, "0")
        const mins = String(now.getMinutes()).padStart(2, "0")
        const secs = String(now.getSeconds()).padStart(2, "0")
        terminalTime.textContent = `${hours}:${mins}:${secs}`
      }
  
      updateTime()
      this.intervals.push(setInterval(updateTime, 1000))
    }
  
    /**
     * Fait fluctuer le niveau de radiation
     */
    startRadiationFluctuation() {
      const updateRadiation = () => {
        const radLevel = document.getElementById("rad-level")
        if (!radLevel) return
  
        const fluctuation =
          Math.floor(Math.random() * this.config.radiationFluctuation) - this.config.radiationFluctuation / 2
        radLevel.textContent = this.config.baseRadiation + fluctuation
      }
  
      this.intervals.push(setInterval(updateRadiation, 500))
    }
  
    /**
     * Anime les clics du compteur Geiger
     */
    startGeigerClicks() {
      const geigerClick = () => {
        const clicks = document.querySelectorAll(".click")
        if (!clicks.length) return
  
        const randomClick = clicks[Math.floor(Math.random() * clicks.length)]
        randomClick.classList.add("active")
        setTimeout(() => randomClick.classList.remove("active"), 100)
      }
  
      const scheduleClick = () => {
        geigerClick()
        const nextDelay = Math.random() * 300 + 100
        setTimeout(scheduleClick, nextDelay)
      }
  
      scheduleClick()
    }
  
    /**
     * Déclenche des glitches aléatoires
     */
    startRandomGlitch() {
      const randomGlitch = () => {
        if (Math.random() > 0.7) {
          const staticNoise = document.querySelector(".static-noise")
          if (!staticNoise) return
  
          staticNoise.classList.add("active")
          setTimeout(() => staticNoise.classList.remove("active"), 150)
        }
      }
  
      this.intervals.push(setInterval(randomGlitch, 2000))
    }
  
    /**
     * Gère la progression du chargement
     */
    startProgress() {
      const progressFill = document.querySelector(".progress-fill")
      const progressPercent = document.querySelector(".progress-percent")
      const asciiFill = document.querySelector(".ascii-fill")
      const asciiEmpty = document.querySelector(".ascii-empty")
  
      const statusChecks = [
        document.getElementById("check-1"),
        document.getElementById("check-2"),
        document.getElementById("check-3"),
        document.getElementById("check-4"),
      ]
  
      const interval = setInterval(() => {
        this.progress += Math.random() * 4 + 1
  
        if (this.progress >= 100) {
          this.progress = 100
          clearInterval(interval)
  
          // Valider tous les checks
          statusChecks.forEach((check) => {
            if (check) {
              check.textContent = "[OK]"
              check.classList.add("success")
            }
          })
  
          // Transition vers le panneau de contrôle
          setTimeout(() => {
            this.transitionToControls()
          }, 800)
        }
  
        // Mise à jour des visuels
        if (progressFill) progressFill.style.width = `${this.progress}%`
        if (progressPercent) progressPercent.textContent = `${Math.floor(this.progress)}%`
  
        // Barre ASCII
        const asciiProgress = Math.floor(this.progress / 5)
        if (asciiFill) asciiFill.textContent = "█".repeat(asciiProgress)
        if (asciiEmpty) asciiEmpty.textContent = "░".repeat(20 - asciiProgress)
  
        // Checks progressifs
        const checkThresholds = [25, 50, 75, 95]
        checkThresholds.forEach((threshold, index) => {
          if (this.progress > threshold && this.checkIndex === index) {
            if (statusChecks[index]) {
              statusChecks[index].textContent = "[OK]"
              statusChecks[index].classList.add("success")
            }
            this.checkIndex++
          }
        })
      }, this.config.progressSpeed)
    }
  
    /**
     * Transition du loading screen vers les contrôles
     */
    transitionToControls() {
      if (this.loadingScreen) {
        this.loadingScreen.classList.add("fade-out")
  
        setTimeout(() => {
          this.loadingScreen.style.display = "none"
  
          if (this.controlPanel) {
            this.controlPanel.classList.remove("hidden")
            this.controlPanel.classList.add("fade-in")
          }
  
          // Nettoyer les intervals
          this.cleanup()
        }, 1500)
      }
    }
  
    /**
     * Nettoie les intervals
     */
    cleanup() {
      this.intervals.forEach((interval) => clearInterval(interval))
      this.intervals = []
    }
  
    /**
     * Détruit l'UI Manager
     */
    destroy() {
      this.cleanup()
      if (this.loadingScreen) this.loadingScreen.remove()
      if (this.controlPanel) this.controlPanel.remove()
    }
  }
  