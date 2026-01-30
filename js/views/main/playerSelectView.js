import { clearContainer, gameContainer, navigate } from "../../../app.js"
import { setActivePlayer } from "../../gameEventHandler.js"
import { players } from "../../initGame.js"
import { renderPlayerList } from "../components/renderPlayerList.js"
import { codeView } from "./codeView.js"

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
}