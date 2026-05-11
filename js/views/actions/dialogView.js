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

    // Cancel any narration carrying over from the previous line
    stopNarrationTts();

    if (voiceFile) {
        // Play voice audio with typewriter effect (sound muted)
        currentAudio = new Audio(`./assets/steps/${activePlayer.localisation}/${activeStepId}/${voiceFile}`);
        currentAudio.play().catch(err => console.warn('Audio playback failed:', err));
        typeWriteEffect(textBox, activeText, currentPitch, true);
    } else {
        // No voice, use typewriter effect with sound
        typeWriteEffect(textBox, activeText, currentPitch);

        // Narrator passages (no character, no recorded voice) → read aloud via TTS
        if (!characterId && settings.narrationTts) {
            speakNarrationTts(activeText);
        }
    }
}

// meSpeak.js — offline French TTS that ships its own voice. Independent of
// the browser's Web Speech API, which is unreliable on Firefox/Windows and
// any system without a French voice installed.
// Loaded from jsdelivr (npm "mespeak" package), with permissive CORS headers.
const MESPEAK_BASE = 'https://cdn.jsdelivr.net/npm/mespeak';
let meSpeakReady = false;
let meSpeakLoadingPromise = null;

function loadMeSpeak() {
    if (meSpeakReady) return Promise.resolve(true);
    if (meSpeakLoadingPromise) return meSpeakLoadingPromise;

    meSpeakLoadingPromise = new Promise((resolve) => {
        const onLibReady = () => {
            if (!window.meSpeak) {
                console.warn('[TTS] meSpeak global not present after script load');
                resolve(false);
                return;
            }
            try {
                // Config and voice both fetch async — wait for config before requesting voice,
                // otherwise meSpeak.speak() fires before the config arrives.
                window.meSpeak.loadConfig(`${MESPEAK_BASE}/mespeak_config.json`, (configStatus) => {
                    const configOk = configStatus === true || (typeof configStatus === 'string' && /loaded/i.test(configStatus));
                    if (!configOk) {
                        console.warn('[TTS] meSpeak config failed to load:', configStatus);
                        resolve(false);
                        return;
                    }
                    window.meSpeak.loadVoice(`${MESPEAK_BASE}/voices/fr.json`, (voiceStatus) => {
                        const voiceOk = voiceStatus === true || (typeof voiceStatus === 'string' && /loaded/i.test(voiceStatus));
                        if (voiceOk) {
                            meSpeakReady = true;
                            console.log('[TTS] meSpeak config + French voice loaded');
                            resolve(true);
                        } else {
                            console.warn('[TTS] meSpeak voice failed to load:', voiceStatus);
                            resolve(false);
                        }
                    });
                });
            } catch (e) {
                console.warn('[TTS] meSpeak config/voice load threw:', e);
                resolve(false);
            }
        };

        if (window.meSpeak) {
            onLibReady();
            return;
        }
        const script = document.createElement('script');
        script.src = `${MESPEAK_BASE}/mespeak.js`;
        script.async = true;
        script.onload = onLibReady;
        script.onerror = () => {
            console.warn('[TTS] meSpeak library failed to load from CDN');
            resolve(false);
        };
        document.head.appendChild(script);
    });
    return meSpeakLoadingPromise;
}

function cleanTtsText(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

let currentTtsAudio = null;

function speakNarrationTts(text) {
    const clean = cleanTtsText(text);
    if (!clean) return;

    loadMeSpeak().then((ok) => {
        if (!ok) return;
        try { stopNarrationTts(); } catch (_) {}

        // canPlay() == false means the AudioContext isn't ready (autoplay policy).
        // Should be true after the user has clicked any dialog.
        const canPlay = typeof window.meSpeak.canPlay === 'function' ? window.meSpeak.canPlay() : 'unknown';
        console.log('[TTS] speak →', clean.slice(0, 60), '| canPlay:', canPlay);

        try {
            const result = window.meSpeak.speak(
                clean,
                { pitch: 50, speed: 160, amplitude: 100 },
                (success) => {
                    console.log('[TTS] speak callback success:', success);
                }
            );
            console.log('[TTS] speak() returned:', typeof result, result && (result.byteLength || result.length || result));
        } catch (e) {
            console.warn('[TTS] meSpeak.speak threw:', e);
        }
    });
}

function stopNarrationTts() {
    if (currentTtsAudio) {
        try {
            currentTtsAudio.pause();
            currentTtsAudio.src = '';
        } catch (_) {}
        currentTtsAudio = null;
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