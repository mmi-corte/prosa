import { clearContainer, gameContainer } from "../../../app.js";
import { activePlayer, activeStepId, callAction } from "../../gameEventHandler.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { dialogsData } from "../../loadData.js";
import { getTranslation } from "../../langageManager.js";

let textBox
let data
let currentDialogIndex = 0;
let currentBackground
let currentPitch = 400;
let currentAudio = null;

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
        const activeText = getTranslation(data.dialog[currentDialogIndex].text);

        if (isTyping) { //If typerite effect is still active...
            skipTypeWrite()
            textBox.innerHTML = activeText;
        } else { //Go to next dialog if the text is fully displayed
            // Stop any playing audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            
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
    const activeText = getTranslation(data.dialog[currentDialogIndex].text);
    const voiceFile = data.dialog[currentDialogIndex].voice;
    currentPitch = data.dialog[currentDialogIndex].pitch || undefined;
    
    if (voiceFile) {
        // Play voice audio and display text immediately (no typewriter)
        textBox.innerHTML = activeText;
        currentAudio = new Audio(`./assets/steps/${activePlayer.localisation}/${activeStepId}/${voiceFile}`);
        currentAudio.play().catch(err => console.warn('Audio playback failed:', err));
    } else {
        // No voice, use typewriter effect
        typeWriteEffect(textBox, activeText, currentPitch);
    }
}

