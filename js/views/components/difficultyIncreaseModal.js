import { gameContainer } from "../../../app.js"

/**
 * Show a temporary modal indicating difficulty increase
 * @param {Function} onExitFunction - Callback function to execute when modal closes
 * @param {number} duration - Duration in milliseconds (default: 2000)
 */
export function difficultyIncreaseModal(onExitFunction, duration = 2000) {
  const modal = document.createElement('div')
  modal.classList.add('endWrapper', 'dangerWrapper')
  gameContainer.appendChild(modal)

  const textIndication = document.createElement('div')
  textIndication.classList.add('text_indication')
  textIndication.innerText = "La jauge de difficulté augmente !"
  modal.appendChild(textIndication)

  setTimeout(() => modal.classList.add("show"), 10)

  setTimeout(() => {
    modal.remove()
    if (onExitFunction && typeof onExitFunction === 'function') {
      onExitFunction()
    }
  }, duration)
}
