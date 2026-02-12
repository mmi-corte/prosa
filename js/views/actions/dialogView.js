import { clearContainer, gameContainer } from "../../../app.js";
import { activePlayer, activeStepId, callAction } from "../../gameEventHandler.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { charactersData, dialogsData } from "../../loadData.js";
import { getTranslation } from "../../langageManager.js";

let textBox
let textContainer
let characterNameBox
let characterName
let data
let currentDialogIndex = 0;
let currentBackground
let currentAudio = null;

export function dialogView(action) {
    clearContainer();

    data = dialogsData[action];

    const wrapper = document.createElement('div');
    wrapper.classList.add('dialogWrapper');
    wrapper.style.backgroundImage = `url(./assets/steps/${activePlayer.localisation}/${activeStepId}/${data.default.backgroundUrl})`
    gameContainer.appendChild(wrapper);

    textContainer = document.createElement('div');
    textContainer.classList.add('dialogTextContainer');
    wrapper.appendChild(textContainer);

    textBox = document.createElement('p');
    textBox.innerText = "";
    textContainer.appendChild(textBox);

    characterNameBox = document.createElement('div');
    characterNameBox.classList.add('characterNameBox');
    textContainer.appendChild(characterNameBox);

    characterName = document.createElement('span');
    characterName.innerText = "";
    characterNameBox.appendChild(characterName);

    //Reset var for index
    currentDialogIndex = 0;

    updateDialog();

    //Add click event logic for next dialog
    textContainer.addEventListener('click', () => {
        const activeText = getTranslation(data.dialog[currentDialogIndex].text);

        if (isTyping) { //If typewrite effect is still active...
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
    const characterId = data.dialog[currentDialogIndex].character || "";
    characterNameBox.style.backgroundColor = '#FFFFFF';
    characterName.style.color = '#FFFFFF';
    characterNameBox.classList.remove('shown')
    let currentPitch = 400; // Default pitch

    if (characterId) {
        const currentCharacter = getCharacterDetails(characterId);
        if (currentCharacter) {
            characterName.innerText = getTranslation(currentCharacter.name);
            characterNameBox.style.backgroundColor = currentCharacter.color || '#FFFFFF';
            characterName.style.color = currentCharacter.color || '#FFFFFF';
            characterNameBox.classList.add('shown')
            currentPitch = currentCharacter.pitch || 400;
        }
    }

    if (voiceFile) {
        // Play voice audio with typewriter effect (sound muted)
        currentAudio = new Audio(`./assets/steps/${activePlayer.localisation}/${activeStepId}/${voiceFile}`);
        currentAudio.play().catch(err => console.warn('Audio playback failed:', err));
        typeWriteEffect(textBox, activeText, currentPitch, true);
    } else {
        // No voice, use typewriter effect with sound
        typeWriteEffect(textBox, activeText, currentPitch);
    }
}

function getCharacterDetails(characterId) {
    return charactersData[characterId] || null;
}

