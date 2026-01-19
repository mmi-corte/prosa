import { clearContainer, gameContainer } from "../../../app.js";
import { callAction } from "../../gameEventHandler.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { dialogsData } from "../../initGameData.js";

let textBox = "";
let dialogData = "";
let currentDialogIndex = 0;
let currentPitch = 400;

export function dialogView(action) {
    clearContainer();
    currentDialogIndex = 0;
    dialogData = dialogsData[action];

    const wrapper = document.createElement('div');
    wrapper.classList.add('dialogWrapper');
    gameContainer.appendChild(wrapper);

    textBox = document.createElement('p');
    textBox.innerText = "";
    gameContainer.appendChild(textBox);

    updateDialog();

    textBox.addEventListener('click', () => {
        const fullText = dialogData.dialog[currentDialogIndex].text.fr;

        if (isTyping) {
            skipTypeWrite()
            textBox.innerHTML = fullText;
        } else {
            //Go to next dialog if the text is fully displayed
            currentDialogIndex += 1;
            if (dialogData.dialog.length > currentDialogIndex) {
                updateDialog();
            } else {
                callAction(dialogData.nextActionType, dialogData.nextAction);
            }
        }
    });
}

function updateDialog() {
    const fullText = dialogData.dialog[currentDialogIndex].text.fr;
    currentPitch = dialogData.dialog[currentDialogIndex].pitch || 400;
    typeWriteEffect(textBox, fullText, currentPitch);
}

