import { navigate } from "../../../../app.js";
import { gameInitialized, savePlayerData } from "../../../initGame.js";
import { renderPlayerList } from "../../components/renderPlayerList.js";
import { clearInitContainer, initContainer } from "../initView.js";
import { menuView } from "../menuView.js";

export function playerSubmitView(selectedPlayers) {
    if (gameInitialized) {
        navigate('menu', menuView(), true)
    }

    clearInitContainer()
    initContainer.classList.add('initScreen3');

    renderPlayerList(initContainer, selectedPlayers)

    const submitButton = document.createElement('button')
    submitButton.classList.add("btn-primary")
    submitButton.innerText = 'Valider'
    initContainer.appendChild(submitButton)

    submitButton.addEventListener('click', () => {
        savePlayerData(selectedPlayers)
        navigate('menu', menuView(), true)
    })
}