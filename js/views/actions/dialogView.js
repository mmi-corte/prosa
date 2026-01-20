import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { dialogsData } from "../../initGameData.js";

let textBox = "";
let data = "";
let currentDialogIndex = 0;
let currentPitch = 400;

export function dialogView(action) {
    clearContainer();
    currentDialogIndex = 0;

    data = dialogsData[activeStepId][action];

    const wrapper = document.createElement('div');
    wrapper.classList.add('dialogWrapper');
    gameContainer.appendChild(wrapper);

    textBox = document.createElement('p');
    textBox.innerText = "";
    wrapper.appendChild(textBox);

    updateDialog();

    textBox.addEventListener('click', () => {
        const fullText = data.dialog[currentDialogIndex].text.fr;

        if (isTyping) {
            skipTypeWrite()
            textBox.innerHTML = fullText;
        } else {
            //Go to next dialog if the text is fully displayed
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
    const fullText = data.dialog[currentDialogIndex].text.fr;
    currentPitch = data.dialog[currentDialogIndex].pitch || undefined;
    typeWriteEffect(textBox, fullText, currentPitch);
}

