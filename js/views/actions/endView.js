import { clearContainer, gameContainer } from "../../../app.js";
import { activeStep, addUnlockedStep, changePlayerLocalisation, startStep, unsetActivePlayer } from "../../gameEventHandler.js";
import { menuView } from "../main/menuView.js";

export function endView(action, special_end = false) {

    //Check if there is a step to unlock
    if (activeStep.end[action].unlockedStepId && activeStep.end[action].unlockStep) {
        addUnlockedStep(activeStep.end[action].unlockedStepId, activeStep.end[action].unlockStep)
    }

    //Prepare another div if there is text after the step div
    const extraIndication = document.createElement('div')
    extraIndication.classList.add('text_indication')

    const endType = activeStep.end[action].type

    // ==================================
    // ====== Fonction fin d'étape ======
    // ==================================
    switch (endType) {
        //Avancez à la case X
        case "win":
            showEndModal("Avancez à la case", activeStep.end[action].nextStep)
            break;

        //Restez à la case X
        case "still":
            showEndModal("Restez à la case", activeStep.end[action].nextStep)
            break;

        //Reculez à la case X
        case "lose":
            showEndModal("Reculez à la case", activeStep.end[action].nextStep)
            break;

        //Avancez à la case X, mais continuez votre tour
        case "continue":
            showEndModal("Avancez à la case", activeStep.end[action].nextStep, "et continuez votre tour")
            break;

        //Vous êtes bloqué pendant X tours
        case "lose_turn":
            showEndModal("Vous êtes bloqué pendant", activeStep.end[action].turnLoosed, "tours")
            break;
        //Cas spécial arrivé à Prosa
        case "special_end":
            startStep(activeStep.end[action].nextStep, endType)
            break;
        //Cas spécial arrivé à Prosa
        case "prosa_landing":
            changePlayerLocalisation(3)
            showEndModal("Allez à la case", activeStep.end[action].nextStep, "de l'île de Prosa")
            break;
    }
}

function showEndModal(text01, text02, text03 = null) {

    const wrapper = document.createElement('div')
    wrapper.classList.add('endWrapper')
    gameContainer.appendChild(wrapper)

    const textIndication = document.createElement('div')
    textIndication.classList.add('text_indication')
    textIndication.innerText = text01
    wrapper.appendChild(textIndication)

    const textNextStep = document.createElement('div')
    textNextStep.classList.add('next_step')
    textNextStep.innerText = text02
    wrapper.appendChild(textNextStep)

    if (text03) {
        const extraIndication = document.createElement('div')
        extraIndication.classList.add('text_indication')
        extraIndication.innerText = text03
        wrapper.appendChild(extraIndication)
    }

    setTimeout(() => wrapper.classList.add("show"), 10)

    wrapper.addEventListener('click', () => {
        unsetActivePlayer()
        history.replaceState({ view: 'menu' }, "", "#menu")
        menuView()
    })
}