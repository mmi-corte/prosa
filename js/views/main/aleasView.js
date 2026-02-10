import { clearContainer, gameContainer } from "../../../app.js"
import { navigate } from "../../../router.js"
import { callAction } from "../../gameEventHandler.js"
import { decrementDifficultyState } from "../../initGame.js"
import { showBackButton } from "../components/backButton.js"
import { difficultyIncreaseModal } from "../components/difficultyIncreaseModal.js"
import { menuView } from "./menuView.js"

export function aleasView() {
  clearContainer()
  showBackButton()

  const wrapper = document.createElement('div')
  wrapper.classList.add('aleasWrapper', 'menu-content-ingame')
  gameContainer.appendChild(wrapper)

  //Riddle view
  const riddleButton = document.createElement('button')
  riddleButton.classList.add('menu-btn-big', 'btn-primary-big')
  riddleButton.innerHTML = `ÉNIGME`

  riddleButton.addEventListener('click', () => {
    navigate("aleas/enigme", () => callAction("aleasRiddle"))
  })
  wrapper.appendChild(riddleButton)

  //Lose point button
  const loseButton = document.createElement('button')
  loseButton.classList.add('menu-btn-big')
  loseButton.innerHTML = `AUGMENTATION JAUGE`

  loseButton.addEventListener('click', () => {
    navigate("aleas/confirm-augmentation", showConfirmModal)
  })
  wrapper.appendChild(loseButton)
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
      history.replaceState({ view: 'aleas' }, "", "#aleas")
      navigate('menu', menuView())
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