import { clearContainer, gameContainer, extraHeaderContainer, navigate } from "../../../app.js"
import { setActivePlayer } from "../../gameEventHandler.js"
import { players } from "../../initGame.js"
import { renderPlayerList } from "../components/renderPlayerList.js"
import { codeView } from "./codeView.js"
import { menuView } from "./menuView.js"

export function playerSelectView() {
    clearContainer()
    const wrapper = document.createElement('div')
    wrapper.classList.add('playerSelect')
    gameContainer.appendChild(wrapper)

    const title = document.createElement('p')
    title.innerText = "Qui joue ?"
    wrapper.appendChild(title)

    renderPlayerList(wrapper, players, true, (playerIndex) => {
        setActivePlayer(playerIndex)
        navigate('code', codeView())
    })
    
    // Bouton retour (header)
    if (extraHeaderContainer && !extraHeaderContainer.querySelector('.back-btn-circle')) {
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
        extraHeaderContainer.appendChild(backButton)
    }
}