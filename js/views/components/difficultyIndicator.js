import { difficultyIndicator, difficultyLabel } from "../../../app.js"
import { difficultyState, globalDifficulty } from "../../initGame.js"

let difficultyStateDisplay

export function initDifficultyIndicator() {

    if (!difficultyStateDisplay) {
        difficultyStateDisplay = document.createElement('div')
        difficultyStateDisplay.classList.add('battery-fill')

        difficultyIndicator.appendChild(difficultyStateDisplay)
    }
}

export function updateDifficultyIndicator() {

    if (!difficultyStateDisplay) {
        initDifficultyIndicator()
    }


    if (difficultyState && globalDifficulty) {

        //Set the battery display level
        const width = (difficultyState / globalDifficulty) * 100
        difficultyStateDisplay.style.width = width + "%"
        difficultyIndicator.classList.remove('hidden')

        //Set the label
        difficultyLabel.innerHTML = difficultyState
    }
}

export function resetDifficultyIndicator() {
    difficultyIndicator.classList.add('hidden')
    difficultyStateDisplay.style.width = '0%'
}