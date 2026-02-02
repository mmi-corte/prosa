import { navigate } from "../../../../app.js";
import { gameInitialized, initGame, savePlayerData } from "../../../initGame.js";
import { renderPlayerList } from "../../components/renderPlayerList.js";
import { clearInitContainer, initContainer } from "../initView.js";
import { menuView } from "../menuView.js";

export async function playerSubmitView(selectedPlayers) {
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

    submitButton.addEventListener('click', submit(selectedPlayers))
}

async function submit(selectedPlayers) {
    savePlayerData(selectedPlayers)
    await initGame()
    navigate('menu', menuView(), true)
}