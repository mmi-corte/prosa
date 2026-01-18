import { clearContainer, gameContainer } from "../../../app.js";
import { callAction } from "../../gameEventHandler.js";
import { dialogsData } from "../../initGameData.js";

let textBox = ""
let dialogData = ""
//Dummy index for tracking at which dialog we are
let currentDialogIndex = 0
let currentPitch = 400
let isTyping = false; // Prevents overlapping animations

export function dialogView(action) {
    clearContainer()

    //Reset the index for each dialog action
    currentDialogIndex = 0;

    //Set the current dialog from given action
    dialogData = dialogsData[action]

    const wrapper = document.createElement('div')
    wrapper.classList.add('dialogWrapper')

    gameContainer.appendChild(wrapper)

    textBox = document.createElement('p')
    textBox.innerText = ""
    gameContainer.appendChild(textBox)

    updateDialog()

    textBox.addEventListener('click', () => {

        if (isTyping) {
            updateDialog(true)
        }

        currentDialogIndex += 1
        //If there's still dialogs left in the action, continue
        if (dialogData.dialog.length > currentDialogIndex) {
            textBox.innerText = dialogData.dialog[currentDialogIndex]
            updateDialog()
            //Else, skip to the next action
        } else {
            callAction(dialogData.nextActionType, dialogData.nextAction)
        }
    })
}

function updateDialog(skip = false) {
    const fullText = dialogData.dialog[currentDialogIndex].text.fr;
    if (skip) {
        isTyping = false
        textBox.innerHTML = fullText
    } else {
        currentPitch = dialogData.dialog[currentDialogIndex].pitch || 400;
        typeWriterEffect(textBox, fullText);
    }
}

function typeWriterEffect(element, text) {
    element.innerHTML = "";
    isTyping = true;
    let i = 0;

    function type() {
        if (i < text.length) {
            const char = text.charAt(i);
            element.innerHTML += char;

            // Default delay for regular letters
            let currentDelay = 30;

            if (char !== " ") {
                playLetterSound(currentPitch);
            }

            // Check for punctuation to add a pause
            if (char === "." || char === "!" || char === "?") {
                currentDelay = 500; // Half a second pause after a sentence
            } else if (char === "," || char === ":" || char === ";") {
                currentDelay = 200; // Shorter pause for a comma
            }

            i++;
            // Use the dynamic delay
            setTimeout(type, currentDelay);
        } else {
            isTyping = false;
        }
    }

    type();
}

// Create context once (it starts suspended usually)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playLetterSound(pitch) {
    // Resume context if browser paused it
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    // Use the pitch passed to the function
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}