import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction, startStep } from "../../gameEventHandler.js";
import { stepsData } from "../../loadData.js";

export function debugView() {
    clearContainer()

    const text = document.createElement('div')
    text.innerText = `Affichage des étapes pour la localisation ${playerLocalisation}`
    gameContainer.appendChild(text)
    console.log(stepsData)

    Object.keys(stepsData).forEach(step => {
        const forcedStepId = step.slice(0, -1);

        const stepButton = document.createElement('button')
        stepButton.innerText = step

        stepButton.addEventListener('click', () => {
            startStep(forcedStepId)
        })

        gameContainer.appendChild(stepButton)
    })

    const text2 = document.createElement('div')
    text2.innerText = "Appel direct d'une action"
    gameContainer.appendChild(text2)

    const inputStep = document.createElement('input');
    inputStep.type = 'number';
    inputStep.placeholder = 'Step ID';

    const selectType = document.createElement('select');
    ['dialog', 'choice', 'game', 'ar', 'end'].forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.innerText = type;
        selectType.appendChild(opt);
    });

    const inputAction = document.createElement('input');
    inputAction.type = 'number';
    inputAction.placeholder = 'Action ID';

    const btnSubmit = document.createElement('button');
    btnSubmit.innerText = 'Appeler Action';

    btnSubmit.addEventListener('click', () => {
        activeStepId = inputStep.value;
        const actionType = selectType.value;
        const actionId = inputAction.value;

        callAction(actionType, actionId);
    })

    gameContainer.appendChild(inputStep);
    gameContainer.appendChild(selectType);
    gameContainer.appendChild(inputAction);
    gameContainer.appendChild(btnSubmit);
}