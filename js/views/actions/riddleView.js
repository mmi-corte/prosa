import { clearContainer, gameContainer } from "../../../app.js";
import { activePlayer, activeStepId, callAction } from "../../gameEventHandler.js";
import { riddlesData } from "../../loadData.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { getTranslation } from "../../langageManager.js";

let data
let questionContainer
let choiceContainer
let selectedRiddle
let score
let currentAudio = null;
let choicesRendered = false

export async function riddleView(action) {
    clearContainer()
    data = riddlesData[action]

    const wrapper = document.createElement('div');
    wrapper.classList.add('riddleWrapper', 'actionWrapper')
    gameContainer.appendChild(wrapper)

    //Reset score
    score = 0

    //Prepare Question container
    questionContainer = document.createElement('p')
    questionContainer.classList.add('actionQuestion')
    wrapper.appendChild(questionContainer)

    //Prepare choices container
    choiceContainer = document.createElement('div')
    choiceContainer.classList.add('actionChoices')
    wrapper.appendChild(choiceContainer)

    // Select one random riddle from available riddles
    const randomIndex = Math.floor(Math.random() * data.text.length)
    selectedRiddle = data.text[randomIndex]
    choicesRendered = false

    displayRiddle()

    questionContainer.addEventListener('click', () => {
        const activeText = getTranslation(selectedRiddle.question)
        if (isTyping) {
            skipTypeWrite()
            questionContainer.innerHTML = activeText
            renderChoices()
        }
    })
}

async function displayRiddle() {
    const voiceFile = selectedRiddle.voice;

    if (voiceFile) {
        currentAudio = new Audio(`./assets/steps/${activePlayer.localisation}/${activeStepId}/${voiceFile}`);
        currentAudio.play().catch(err => console.warn('Audio playback failed:', err));
    }

    //Type write question
    await typeWriteEffect(
        questionContainer,
        getTranslation(selectedRiddle.question),
        undefined,
        Boolean(voiceFile)
    )

    renderChoices()
}

function renderChoices() {
    if (choicesRendered) return
    choicesRendered = true

    //Show available answers
    selectedRiddle.choices.forEach(choice => {
        const button = document.createElement('button')
        button.classList.add('actionChoiceButton')
        button.innerHTML = getTranslation(choice.text)
        choiceContainer.appendChild(button)

        button.addEventListener('click', () => {
            handleAnswer(choice.score)
        })
    })
}

function handleAnswer(answerScore) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Add answer score to total score
    score += answerScore

    // Continue to next action depending on the total score
    if (score < 0) {
        callAction(data.nextActionTypeLose, data.nextActionLose)
    } else {
        callAction(data.nextActionTypeWin, data.nextActionWin)
    }
}