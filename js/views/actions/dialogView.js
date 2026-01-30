import { clearContainer, gameContainer } from "../../../app.js";
import { activePlayer, activeStepId, callAction } from "../../gameEventHandler.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { dialogsData } from "../../loadData.js";

let textBox
let data
let currentDialogIndex = 0;
let currentBackground
let currentPitch = 400;

export function dialogView(action) {
    clearContainer();

    data = dialogsData[action];

    const wrapper = document.createElement('div');
    wrapper.classList.add('dialogWrapper');
    wrapper.style.backgroundImage = `url(./assets/steps/${activePlayer.localisation}/${activeStepId}/${data.default.backgroundUrl})`
    gameContainer.appendChild(wrapper);

    textBox = document.createElement('p');
    textBox.innerText = "";
    wrapper.appendChild(textBox);

    //Reset var for index
    currentDialogIndex = 0;

    updateDialog();

    //Add click event logic for next dialog
    textBox.addEventListener('click', () => {
        const activeText = data.dialog[currentDialogIndex].text.fr;

        if (isTyping) { //If typerite effect is still active...
            skipTypeWrite()
            textBox.innerHTML = activeText;
        } else { //Go to next dialog if the text is fully displayed
            currentDialogIndex += 1;
            if (data.dialog.length > currentDialogIndex) {
                updateDialog();
            } else {
                callAction(data.nextActionType, data.nextAction);
            }
        }
    });
}

function updateDialog() {
    const activeText = data.dialog[currentDialogIndex].text.fr;
    currentPitch = data.dialog[currentDialogIndex].pitch || undefined;
    typeWriteEffect(textBox, activeText, currentPitch);
}

