import { clearContainer, gameContainer, settings } from "../../../app.js";
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
    if (data.default.backgroundUrl) {
        const bgImg = new Image();
        bgImg.onload = () => {
            wrapper.style.backgroundImage = `url(./assets/steps/${activePlayer.localisation}/${activeStepId}/${data.default.backgroundUrl})`;
            wrapper.style.opacity = '1'; // Show when loaded
        };
        bgImg.onerror = () => {
            wrapper.style.opacity = '1';
        };
        bgImg.src = `./assets/steps/${activePlayer.localisation}/${activeStepId}/${data.default.backgroundUrl}`;
    } else {
        wrapper.style.opacity = '1';
    }

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
            stopNarrationTts();

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
    let currentGender = null;

    if (characterId) {
        const currentCharacter = getCharacterDetails(characterId);
        if (currentCharacter) {
            characterName.innerText = getTranslation(currentCharacter.name);
            characterNameBox.style.backgroundColor = currentCharacter.color || '#FFFFFF';
            characterName.style.color = currentCharacter.color || '#FFFFFF';
            characterNameBox.classList.add('shown')
            currentPitch = currentCharacter.pitch || 400;
            currentGender = currentCharacter.gender || null;
        }
    }

    // Cancel any narration carrying over from the previous line
    stopNarrationTts();

    if (voiceFile) {
        // Play voice audio with typewriter effect (sound muted)
        currentAudio = new Audio(`./assets/steps/${activePlayer.localisation}/${activeStepId}/${voiceFile}`);
        currentAudio.play().catch(err => console.warn('Audio playback failed:', err));
        typeWriteEffect(textBox, activeText, currentPitch, true);
    } else {
        // No voice, use typewriter effect with sound
        typeWriteEffect(textBox, activeText, currentPitch, !settings.typewriterSound);

        if (settings.narrationTts) {
            speakNarrationTts(activeText, currentPitch, currentGender);
        }
    }
}

function cleanTtsText(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const frenchVoiceCache = new Map();

// Some browsers expose a gender property, others only encode it in the voice name.
function isFemaleVoice(voice) {
    if (voice.gender && /female/i.test(voice.gender)) return true;
    const label = `${voice.name || ''} ${voice.voiceURI || ''}`;
    return /(female|femme|hortense|amelie|amélie|anna|victoria|samantha|zira|susan|karen|moira|tessa|otilia|lucia|serena|elvira|fiona)/i.test(label);
}

function isMaleVoice(voice) {
    if (voice.gender && /male/i.test(voice.gender)) return true;
    const label = `${voice.name || ''} ${voice.voiceURI || ''}`;
    return /(male|homme|paul|thomas|nicolas|olivier|daniel|alex|david|mark|george|rishi)/i.test(label);
}

// Resolve a French voice once per requested gender, handling async voiceschanged.
function getFrenchVoice(gender = null) {
    const cacheKey = gender || 'default';
    if (frenchVoiceCache.has(cacheKey)) return Promise.resolve(frenchVoiceCache.get(cacheKey));
    return new Promise((resolve) => {
        const pick = () => {
            const voices = window.speechSynthesis.getVoices();
            const french = voices.filter(v => v.lang === 'fr-FR' || v.lang.startsWith('fr'));
            let selected = null;
            if (gender === 'female') selected = french.find(isFemaleVoice);
            if (gender === 'male') selected = french.find(isMaleVoice);
            selected = selected || french[0] || null;
            frenchVoiceCache.set(cacheKey, selected);
            resolve(selected);
        };
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            pick();
        } else {
            window.speechSynthesis.addEventListener('voiceschanged', pick, { once: true });
        }
    });
}

function speakNarrationTts(text, characterPitch = 400, gender = null) {
    if (!('speechSynthesis' in window)) return;
    const clean = cleanTtsText(text);
    if (!clean) return;

    stopNarrationTts();

    // Map oscillator Hz (250-800) to Web Speech API pitch (0-2), 400Hz → 1.0
    const speechPitch = Math.max(0.1, Math.min(2, characterPitch / 400));

    getFrenchVoice(gender).then((voice) => {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;
        utterance.pitch = speechPitch;
        utterance.volume = (settings.narration ?? 80) / 100;
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    });
}

function stopNarrationTts() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// Expose so the settings toggle can cut narration mid-playback when disabled.
if (typeof window !== 'undefined') {
    window.__prosaStopNarration = stopNarrationTts;
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