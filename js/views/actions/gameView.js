import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { gamesData } from "../../initGameData.js";

let data = ""
export function gameView(action) {
    clearContainer()

    data = gamesData[activeStepId][action]

    const wrapper = document.createElement('div')
    wrapper.innerHTML = data.game
    gameContainer.appendChild(wrapper)

    wrapper.addEventListener('click', () => {
        callAction(data.nextActionTypeWin, data.nextActionWin)
    })
}