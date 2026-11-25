import { clearContainer, gameContainer, settings } from "../../../app.js";
import { aleasRiddlesData } from "../../loadData.js";
import { typeWriteEffect, isTyping, skipTypeWrite } from "../../typeWriteEffect.js";
import { getTranslation } from "../../langageManager.js";
import { activePlayer, activeStepId } from "../../gameEventHandler.js";
import { chooseRiddleIndex, players } from "../../initGame.js";
import { menuView } from "../main/menuView.js";
import { decrementDifficultyState } from "../../initGame.js";
import { correctAnswerModal } from "../components/correctAnswerModal.js";
import { difficultyIncreaseModal } from "../components/difficultyIncreaseModal.js";

let data
let score = 0
let questionContainer
let choiceContainer
let selectedRiddle
let choicesRendered = false

export function aleasRiddleView() {
    clearContainer()

    data = aleasRiddlesData

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

    // Rotate aleas riddles by player and game session as well.
    const riddleKeys = Object.keys(data)
    const playerIndex = Math.max(0, Object.values(players).indexOf(activePlayer))
    const riddleIndex = chooseRiddleIndex(
        riddleKeys.length,
        `aleas:${activePlayer.localisation}:${activeStepId}`,
        playerIndex
    )
    selectedRiddle = data[riddleKeys[riddleIndex]]
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
    //Type write question
    await typeWriteEffect(questionContainer, getTranslation(selectedRiddle.question), undefined, !settings.typewriterSound)

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
    // Add answer score to total score
    score += answerScore

    // Continue to next action depending on the total score
    if (score < 0) {
        decrementDifficultyState()
        clearContainer()
        difficultyIncreaseModal(() => {
            menuView()
        })
    } else {
        correctAnswerModal(() => {
            menuView()
        })
    }
}