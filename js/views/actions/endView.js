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


    //Prepare another div if there is text after the step div
    const extraIndication = document.createElement('div')
    extraIndication.classList.add('text_indication')


    // ==================================
    // ====== Fonction fin d'étape ======
    // ==================================
    switch (action) {
        //Avancez à la case X
        case "1":
            textIndication.innerText = "Avancez à la case"
            textNextStep.innerText = `${activeStep.endStepWin}`
            break;

        //Restez à la case X
        case "2":
            textIndication.innerText = "Restez à la case"
            textNextStep.innerText = activeStep.endStepStill
            break;

        //Reculez à la case X
        case "3":
            textIndication.innerText = "Reculez à la case"
            textNextStep.innerText = activeStep.endStepLoose
            break;

        //Avancez à la case X, mais continuez votre tour
        case "4":
            textIndication.innerText = "Avancez à la case"
            textNextStep.innerText = activeStep.endStepContinue
            extraIndication.innerText = "et continuez votre tour"
            wrapper.appendChild(extraIndication)
            break;
    }

    setTimeout(() => wrapper.classList.add("show"), 10)

    wrapper.addEventListener('click', () => {
        menuView()
    })
}