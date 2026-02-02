import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { choicesData } from "../../loadData.js";
import { typeWriteEffect } from "../../typeWriteEffect.js";
import { getTranslation } from "../../langageManager.js";

export async function choiceView(action) {
    clearContainer()

    const data = choicesData[action]

    const wrapper = document.createElement('div');
    wrapper.classList.add('choiceWrapper')
    gameContainer.appendChild(wrapper)

    const questionContainer = document.createElement('p')
    gameContainer.appendChild(questionContainer)
    await typeWriteEffect(questionContainer, getTranslation(data.question))

    const choiceContainer = document.createElement('div')

    data.choices.forEach(element => {
        const button = document.createElement('button')
        button.innerHTML = getTranslation(element.text)
        choiceContainer.appendChild(button)

        button.addEventListener('click', () => {
            callAction(element.nextActionType, element.nextAction)
        })
        
        gameContainer.appendChild(choiceContainer)

    });
}