import { clearContainer, gameContainer } from "../../../app.js";
import { activeStep } from "../../gameEventHandler.js";
import { menuView } from "../main/menuView.js";

export function endView(action) {

    const wrapper = document.createElement('div')
    wrapper.classList.add('endWrapper')

    gameContainer.appendChild(wrapper)

    const textIndication = document.createElement('div')
    textIndication.classList.add('text_indication')
    const textNextStep = document.createElement('div')
    textNextStep.classList.add('next_step')

    wrapper.appendChild(textIndication)
    wrapper.appendChild(textNextStep)

    //Store the type of ending and the next step number
    const endType = activeStep.end[action].type
    const nextStep = activeStep.end[action].nextStep

    //Prepare another div if there is text after the step div
    const extraIndication = document.createElement('div')
    extraIndication.classList.add('text_indication')


    // ==================================
    // ====== Fonction fin d'étape ======
    // ==================================
    switch (endType) {
        //Avancez à la case X
        case "win":
            textIndication.innerText = "Avancez à la case"
            textNextStep.innerText = nextStep
            break;

        //Restez à la case X
        case "still":
            textIndication.innerText = "Restez à la case"
            textNextStep.innerText = nextStep
            break;

        //Reculez à la case X
        case "lose":
            textIndication.innerText = "Reculez à la case"
            textNextStep.innerText = nextStep
            break;

        //Avancez à la case X, mais continuez votre tour
        case "continue":
            textIndication.innerText = "Avancez à la case"
            textNextStep.innerText = nextStep
            extraIndication.innerText = "et continuez votre tour"
            wrapper.appendChild(extraIndication)
            break;
    }

    setTimeout(() => wrapper.classList.add("show"), 10)

    wrapper.addEventListener('click', () => {
        menuView()
    })
}