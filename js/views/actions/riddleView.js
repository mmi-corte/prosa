import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { riddlesData } from "../../loadData.js";
import { typeWriteEffect } from "../../typeWriteEffect.js";
import { getTranslation } from "../../langageManager.js";

let data
let currentRiddleIndex
let questionContainer
let choiceContainer
let score
let riddles

export async function riddleView(action) {
    clearContainer()
    data = riddlesData[action]

    const wrapper = document.createElement('div');
    wrapper.classList.add('riddleWrapper')
    gameContainer.appendChild(wrapper)

    //Reset var for riddle and index
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
    if (riddles.length > currentRiddleIndex) { //If there's still riddle left...

        //Empty container
        questionContainer.innerHTML = ""
        choiceContainer.innerHTML = ""

        //Type write question
        await typeWriteEffect(questionContainer, getTranslation(riddles[currentRiddleIndex].question))

        //Show availables answers
        riddles[currentRiddleIndex].choices.forEach(riddle => {
            const button = document.createElement('button')
            button.innerHTML = getTranslation(riddle.text)
            choiceContainer.appendChild(button)

            button.addEventListener('click', () => {
                score += riddle.score
                updateRiddle()
            })

            choiceContainer.appendChild(button)
        });
        //Update riddle index for next question
        currentRiddleIndex += 1;

    } else { //If no riddle left, continue no next action, depending on the score fo the player
        if (score < 0) {
            callAction(data.nextActionTypeLoose, data.nextActionLoose)
        } else {
            callAction(data.nextActionTypeWin, data.nextActionWin)
        }
    }
}