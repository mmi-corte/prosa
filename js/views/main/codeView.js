import { clearContainer, gameContainer, headerLeft, vibrate } from "../../../app.js";
import { activePlayer, checkStepExist, startStep } from "../../gameEventHandler.js";
import { stepsData } from "../../loadData.js";
import { showBackButton } from "../components/backButton.js";
import { playerSelectView } from "./playerSelectView.js";

export function codeView() {
    clearContainer()
    showBackButton()

    if (!activePlayer) {
        history.replaceState({ view: 'jeu/choix-joueur' }, "", "#jeu/choix-joueur")
        playerSelectView()
        return
    }

    gameContainer.innerHTML = `
        <div class="code-header">
        <div class="code-title-section">
            <h1 class="code-title">SAISISSEZ LE CODE</h1>
            <p class="code-subtitle">pour découvrir l'énigme.</p>
        </div>
        </div>

        <div class="code-display" id="codeDisplay">
            <span class="code-digit" data-index="0"></span>
            <span class="code-digit" data-index="1"></span>
        </div>

        <div class="keypad">
            <button class="key" data-value="1">1</button>
            <button class="key" data-value="2">2</button>
            <button class="key" data-value="3">3</button>
            <button class="key" data-value="4">4</button>
            <button class="key" data-value="5">5</button>
            <button class="key" data-value="6">6</button>
            <button class="key" data-value="7">7</button>
            <button class="key" data-value="8">8</button>
            <button class="key" data-value="9">9</button>
            <button class="key key-delete" id="keyDelete" aria-label="Effacer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
            </button>
            <button class="key" data-value="0">0</button>
            <button class="key key-validate" id="keyValidate" aria-label="Valider">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
                </svg>
            </button>
        </div>
    `

    const codeDisplay = document.querySelectorAll(".code-digit")
    const keypadKeys = document.querySelectorAll(".key[data-value]")
    const keyDelete = document.getElementById("keyDelete")
    const keyValidate = document.getElementById("keyValidate")

    keypadKeys.forEach(key =>
        key.addEventListener("click", () => addDigit(key.dataset.value))
    )
    keyDelete.addEventListener("click", deleteDigit)
    keyValidate.addEventListener("click", submitCode)

    let currentCode = ""

    function addDigit(value) {
        if (currentCode.length < 2) {
            currentCode += value
            updateCode()
            vibrate(10)
        }
    }

    function deleteDigit() {
        currentCode = currentCode.slice(0, -1)
        updateCode()
        vibrate(10)
    }

    function updateCode() {
        const paddedCode = currentCode.padStart(2, "0")
        codeDisplay.forEach((digit, index) => {
            if (!currentCode.length) {
                digit.textContent = ""
            } else {
                digit.textContent = paddedCode[index] || ""
            }
            digit.classList.remove("error")
        })
    }

    async function submitCode() {
        if (currentCode.length === 0) return codeError()
        console.log("Submitting code: ", currentCode)
        //Add leading zero
        const normalizedCode = currentCode.padStart(2, "0")
        console.log("Submitted code: ", normalizedCode)

        //Check if the step exist, then start if exist
        const stepId = await checkStepExist(normalizedCode)
        console.log("Step ID returned: ", stepId)
        if (stepId) {
            codeSuccess(stepId)
        } else {
            codeError()
        }
    }

    function codeSuccess(stepId) {
        // Create success overlay
        const overlay = document.createElement("div")
        overlay.className = "success-overlay"
        overlay.innerHTML = `
            <div class="success-content">
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p class="success-text">ACCÈS AUTORISÉ</p>
            </div>
        `
        document.body.appendChild(overlay)

        setTimeout(() => overlay.classList.add("show"), 10)
        vibrate([50, 100, 50])

        setTimeout(() => {
            overlay.classList.remove('show')
            overlay.remove()
            //Start the step
            startStep(stepId)
        }, 1500)
    }

    function codeError() {
        document.querySelectorAll(".code-digit").forEach(d => d.classList.add("error"))
        vibrate([50, 30, 50])
        setTimeout(() => {
            currentCode = ""
            updateCode()
        }, 500)
    }
}