import { clearContainer, gameContainer, headerLeft } from "../../../app.js"
import { navigate } from "../../../router.js"
import { setActivePlayer } from "../../gameEventHandler.js"
import { players } from "../../initGame.js"
import { showBackButton } from "../components/backButton.js"
import { renderPlayerList } from "../components/renderPlayerList.js"
import { codeView } from "./codeView.js"
import { menuView } from "./menuView.js"

export function playerSelectView() {
    clearContainer()
    showBackButton()
    const wrapper = document.createElement('div')
    wrapper.classList.add('playerSelect')
    gameContainer.appendChild(wrapper)

    const title = document.createElement('p')
    title.innerText = "Qui joue ?"
    title.classList.add('player-select-title');
    wrapper.appendChild(title)

    renderPlayerList(wrapper, players, true, (playerIndex) => {
        setActivePlayer(playerIndex)
        navigate('jeu/code', codeView())
    })
}