import { clearContainer, gameContainer, settings } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { choicesData } from "../../loadData.js";
import { typeWriteEffect } from "../../typeWriteEffect.js";
import { getTranslation } from "../../langageManager.js";

export async function choiceView(action) {
    clearContainer()

    const data = choicesData[action]

    const wrapper = document.createElement('div');
    wrapper.classList.add('choiceWrapper', 'actionWrapper')
    gameContainer.appendChild(wrapper)

    const questionContainer = document.createElement('p')
    questionContainer.classList.add('actionQuestion')
    wrapper.appendChild(questionContainer)
    await typeWriteEffect(questionContainer, getTranslation(data.question.fr), undefined, !settings.typewriterSound)

    const choiceContainer = document.createElement('div')
    choiceContainer.classList.add('actionChoices')
    wrapper.appendChild(choiceContainer)

    data.choices.forEach(element => {
        const button = document.createElement('button')
        button.classList.add('actionChoiceButton')
        button.innerHTML = getTranslation(element.text.fr)
        choiceContainer.appendChild(button)

        button.addEventListener('click', () => {
            callAction(element.nextActionType, element.nextAction)
        })
        
    });
}