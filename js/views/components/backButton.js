import { headerLeft } from "../../../app.js"
import { activeStep, advanceToNextStep } from "../../gameEventHandler.js"

let backButton
let backButtonState = 0

// While a step is displayed the header arrow is a "next step" control, not a
// history back button. Other screens keep the regular back behaviour.
function isStepScreen() {
    return Boolean(activeStep) && window.location.hash.startsWith('#jeu/etape')
}

export function showBackButton(onClickFunction = null) {
    // Always recreate the button: a stale callback from a previous view must never
    // survive a navigation (e.g. the difficulty modal's "quit progression" action).
    removeBackButton()

    const forward = typeof onClickFunction !== 'function' && isStepScreen()
    const chevron = forward ? "9 6 15 12 9 18" : "15 18 9 12 15 6"

    backButton = document.createElement('button')
    backButton.classList.add('back-btn-circle')
    if (forward) backButton.classList.add('forward-btn-circle')
    backButton.setAttribute('aria-label', forward ? 'Étape suivante' : 'Retour')
    backButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="${chevron}"></polyline>
      </svg>
    `
    backButton.addEventListener('click', () => {
        if (typeof onClickFunction === 'function') {
            onClickFunction()
        } else if (forward) {
            advanceToNextStep()
        } else {
            window.history.back()
        }
    })
    headerLeft?.appendChild(backButton)
    backButtonState = 1
}

export function removeBackButton() {
    if (backButton && backButton.parentNode) {
        backButton.parentNode.removeChild(backButton)
        backButton = null
        backButtonState = 0
    }
}
