import { clearContainer, gameContainer, navigate } from "../../../app.js"
import { callAction } from "../../gameEventHandler.js"
import { decrementDifficultyState } from "../../initGame.js"
import { difficultyIncreaseModal } from "../components/difficultyIncreaseModal.js"
import { menuView } from "./menuView.js"

export function aleasView() {
  clearContainer()

  const wrapper = document.createElement('div')
  wrapper.classList.add('aleasWrapper', 'menu-content-ingame')
  gameContainer.appendChild(wrapper)

  //Riddle view
  const riddleButton = document.createElement('button')
  riddleButton.classList.add('menu-btn-big', 'btn-primary-big')
  riddleButton.innerHTML = `ÉNIGME`

  riddleButton.addEventListener('click', () => {
    navigate("enigme", () => callAction("aleasRiddle"))
  })
  wrapper.appendChild(riddleButton)

  //Lose point button
  const loseButton = document.createElement('button')
  loseButton.classList.add('menu-btn-big')
  loseButton.innerHTML = `AUGMENTATION JAUGE`

  loseButton.addEventListener('click', () => {
    showConfirmModal()
  })
  wrapper.appendChild(loseButton)

  // Add back button to header
  const headerLeft = document.getElementById('headerLeft')
  if (headerLeft && !headerLeft.querySelector('.back-btn-circle')) {
    const backButton = document.createElement('button')
    backButton.classList.add('back-btn-circle')
    backButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `
    backButton.addEventListener('click', () => {
      menuView()
    })
    headerLeft.appendChild(backButton)
  }
}

function showConfirmModal() {
  const modal = document.createElement('div')
  modal.classList.add('endWrapper')
  gameContainer.appendChild(modal)

  //Text indication
  const textIndication = document.createElement('div')
  textIndication.classList.add('text_indication')
  textIndication.innerText = "Êtes-vous sûr de vouloir augmenter la jauge ?"
  modal.appendChild(textIndication)

  //Confirm and cancel buttons 
  const buttonsContainer = document.createElement('nav')
  buttonsContainer.classList.add('menu-buttons')
  modal.appendChild(buttonsContainer)

  const confirmButton = document.createElement('button')
  confirmButton.classList.add('menu-btn', 'btn-primary-big')
  confirmButton.innerHTML = `<span class="btn-title">Confirmer</span>`
  confirmButton.addEventListener('click', () => {
    decrementDifficultyState()
    modal.remove()
    clearContainer()
    difficultyIncreaseModal(() => {
      menuView()
    })
  })
  buttonsContainer.appendChild(confirmButton)

  const cancelButton = document.createElement('button')
  cancelButton.classList.add('menu-btn')
  cancelButton.innerHTML = `<span class="btn-title">Annuler</span>`
  cancelButton.addEventListener('click', () => {
    modal.remove()
  })
  buttonsContainer.appendChild(cancelButton)


  setTimeout(() => modal.classList.add("show"), 10)
}