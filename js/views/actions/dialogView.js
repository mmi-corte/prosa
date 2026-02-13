import { clearContainer, gameContainer } from "../../../app.js";
import { activePlayer, activeStepId, callAction } from "../../gameEventHandler.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { charactersData, dialogsData } from "../../loadData.js";
import { getTranslation } from "../../langageManager.js";
import { playedDialogs, trackDialog } from "../../initGame.js";

let textBox
let textContainer
let foregroundContainer
let characterNameBox
let characterName
let data
let currentDialogIndex = 0;
let currentAudio = null;
let currentForegroundSrc = "";
const FOREGROUND_HIDE_DELAY = 300;

export function dialogView(action) {
    clearContainer();

    data = dialogsData[action];

    currentForegroundSrc = "";

    const wrapper = document.createElement('div');
    wrapper.classList.add('dialogWrapper');
    wrapper.style.opacity = '0'; // Start hidden
    gameContainer.appendChild(wrapper);

    // Preload background image
    const bgImg = new Image();
    bgImg.onload = () => {
        wrapper.style.backgroundImage = `url(./assets/steps/${activePlayer.localisation}/${activeStepId}/${data.default.backgroundUrl})`;
        wrapper.style.opacity = '1'; // Show when loaded
    };
    bgImg.onerror = () => {
        // Still show even if error
        wrapper.style.opacity = '1';
    };
    bgImg.src = `./assets/steps/${activePlayer.localisation}/${activeStepId}/${data.default.backgroundUrl}`;

    // Create foreground container
    foregroundContainer = document.createElement('div');
    foregroundContainer.classList.add('foregroundImage');
    if (data.default.foregroundUrl) {
        foregroundContainer.style.opacity = '0'; // Start hidden
    }
    wrapper.appendChild(foregroundContainer);

    if (hasPlayedDialog(action)) {
        const skipButtion = document.createElement('button');
        skipButtion.innerText = "Passer ce dialogue";
        skipButtion.classList.add('skipDialogButton');
        skipButtion.addEventListener('click', () => {
            stopDialogAudio();
            callAction(data.nextActionType, data.nextAction);
        });
        wrapper.appendChild(skipButtion);
    }

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
    const foregroundFile = data.dialog[currentDialogIndex].foreground || "";
    const showForeground = Boolean(foregroundFile);

    characterNameBox.style.backgroundColor = '#FFFFFF';
    characterName.style.color = '#FFFFFF';
    characterNameBox.classList.remove('shown')

    // Update foreground visibility
    if (showForeground) {
        const nextSrc = `./assets/steps/${activePlayer.localisation}/${activeStepId}/${foregroundFile}`;
        if (currentForegroundSrc === nextSrc) {
            foregroundContainer.style.backgroundImage = `url(${nextSrc})`;
            foregroundContainer.classList.add('shown');
        } else {
            // Sequential swap: hide -> update URL -> show
            foregroundContainer.classList.remove('shown');

            // Wait for the hide transition to finish before changing the image
            setTimeout(() => {
                // Wait for image to load before showing
                const img = new Image();
                img.onload = () => {
                    currentForegroundSrc = nextSrc;
                    foregroundContainer.style.backgroundImage = `url(${nextSrc})`;
                    if (showForeground) {
                        foregroundContainer.classList.add('shown');
                    }
                };
                img.onerror = () => {
                    // Still show even if error
                    currentForegroundSrc = nextSrc;
                    foregroundContainer.style.backgroundImage = `url(${nextSrc})`;
                    if (showForeground) {
                        foregroundContainer.classList.add('shown');
                    }
                };
                img.src = nextSrc;
            }, FOREGROUND_HIDE_DELAY);
        }
    } else {
        foregroundContainer.classList.remove('shown');
    }

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

function hasPlayedDialog(dialogId) {
    console.log(playedDialogs)
    if (playedDialogs && playedDialogs?.[activePlayer.localisation]?.[activeStepId]?.includes(dialogId)) {
        return true
    } else {
        trackDialog(activePlayer.localisation, activeStepId, dialogId)
        return false
    }
}

function stopDialogAudio() {
    skipTypeWrite();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};