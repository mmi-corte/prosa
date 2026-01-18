import { clearContainer, gameContainer } from "../../../app.js";
import { dialogView } from "../actions/dialogView.js";

export function debugView() {
    clearContainer()

    const dialogButton = document.createElement('button')
    dialogButton.innerText = "dialogue"
    gameContainer.appendChild(dialogButton)
    dialogButton.addEventListener('click', () => {
        dialogView()
    })

}