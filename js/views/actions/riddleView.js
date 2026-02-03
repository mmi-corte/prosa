import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { riddlesData } from "../../loadData.js";
import { typeWriteEffect } from "../../typeWriteEffect.js";
import { getTranslation } from "../../langageManager.js";

let data
let questionContainer
let choiceContainer
let selectedRiddle
let score

export async function riddleView(action) {
    clearContainer()
    data = riddlesData[action]

    const wrapper = document.createElement('div');
    wrapper.classList.add('riddleWrapper')
    gameContainer.appendChild(wrapper)

    //Reset score
    score = 0

    //Prepare Question container
    questionContainer = document.createElement('p')
    wrapper.appendChild(questionContainer)

    //Prepare choices container
    choiceContainer = document.createElement('div')
    wrapper.appendChild(choiceContainer)

    // Select one random riddle from available riddles
    const randomIndex = Math.floor(Math.random() * data.text.length)
    selectedRiddle = data.text[randomIndex]

    displayRiddle()
}

async function displayRiddle() {
    //Type write question
    await typeWriteEffect(questionContainer, getTranslation(selectedRiddle.question))

    //Show available answers
    selectedRiddle.choices.forEach(choice => {
        const button = document.createElement('button')
        button.innerHTML = getTranslation(choice.text)
        choiceContainer.appendChild(button)

        button.addEventListener('click', () => {
            handleAnswer(choice.score)
        })
    })
}

function handleAnswer(answerScore) {
    // Add answer score to total score
    score += answerScore
    
    // Continue to next action depending on the total score
    if (score < 0) {
        callAction(data.nextActionTypeLose, data.nextActionLose)
    } else {
        callAction(data.nextActionTypeWin, data.nextActionWin)
    }
}