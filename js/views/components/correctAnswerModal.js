import { gameContainer } from "../../../app.js"

/**
 * Show a temporary modal indicating correct answer
 * @param {Function} onExitFunction - Callback function to execute when modal closes
 * @param {number} duration - Duration in milliseconds (default: 2000)
 */
export function correctAnswerModal(onExitFunction, duration = 2000) {
  const modal = document.createElement('div')
  modal.classList.add('endWrapper')
  gameContainer.appendChild(modal)

  const textIndication = document.createElement('div')
  textIndication.classList.add('text_indication')
  textIndication.innerText = "Bonne réponse !"
  modal.appendChild(textIndication)

  setTimeout(() => modal.classList.add("show"), 10)

  setTimeout(() => {
    modal.remove()
    if (onExitFunction && typeof onExitFunction === 'function') {
      onExitFunction()
    }
  }, duration)
}
