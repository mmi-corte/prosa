import { headerLeft } from "../../../app.js"

let backButton
let backButtonState = 0

export function showBackButton(onClickFunction = null) {

    if (backButtonState === 0) {
        backButton = document.createElement('button')
        backButton.classList.add('back-btn-circle')
        backButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        `
        backButton.addEventListener('click', () => {
            if (onClickFunction && typeof onClickFunction === 'function') {
                onClickFunction()
            } else {
                window.history.back()
            }
        })
        headerLeft.appendChild(backButton)
        backButtonState = 1
    } else if (backButtonState === 1 && onClickFunction !== null) {
        removeBackButton()
        showBackButton(onClickFunction)
    }
}

export function removeBackButton() {
    if (backButton && backButton.parentNode) {
        backButton.parentNode.removeChild(backButton)
        backButton = null
        backButtonState = 0
    }
}
