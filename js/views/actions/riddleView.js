import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { riddlesData } from "../../initGameData.js";
import { typeWriteEffect } from "../../typeWriteEffect.js";

let data
let currentRiddleIndex
let questionContainer
let choiceContainer
let score
let riddles

export async function riddleView(action) {
    clearContainer()
    data = riddlesData[activeStepId][action]

    const wrapper = document.createElement('div');
    wrapper.classList.add('riddleWrapper')
    gameContainer.appendChild(wrapper)

    //Set score for riddle and index
    score = 0
    currentRiddleIndex = 0

    //Prepare Question container
    questionContainer = document.createElement('p')
    wrapper.appendChild(questionContainer)

    //Prepare choices container
    choiceContainer = document.createElement('div')
    wrapper.appendChild(choiceContainer)

    // Prepare riddles ans shuffle them if "random" is true
    riddles = [...data.text]
    if (data.random) {
        riddles = riddles.sort(() => Math.random() - 0.5);
    }

    updateRiddle()
}

async function updateRiddle() {
    if (riddles.length > currentRiddleIndex) {
        questionContainer.innerHTML = ""
        choiceContainer.innerHTML = ""

        console.log(riddles)
        console.log(data)

        await typeWriteEffect(questionContainer, riddles[currentRiddleIndex].question)

        riddles[currentRiddleIndex].choices.forEach(riddle => {
            const button = document.createElement('button')
            button.innerHTML = riddle.text
            choiceContainer.appendChild(button)

            button.addEventListener('click', () => {
                score += riddle.score
                console.log(score)
                updateRiddle()
            })

            choiceContainer.appendChild(button)
        });

        currentRiddleIndex += 1;
    } else {
        if (score < 0) {
            callAction(data.nextActionTypeLoose, data.nextActionLoose)
        } else {
            callAction(data.nextActionTypeWin, data.nextActionWin)
        }
    }
}