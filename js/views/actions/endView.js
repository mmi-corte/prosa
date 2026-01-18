import { clearContainer, gameContainer } from "../../../app.js";
import { activeStep } from "../../gameEventHandler.js";
import { menuView } from "../main/menuView.js";

export function endView(action) {
    clearContainer()

    const wrapper = document.createElement('div')
    wrapper.classList.add('endWrapper')

    gameContainer.appendChild(wrapper)

    const textBox = document.createElement('p')
    textBox.innerText = ""
    gameContainer.appendChild(textBox)

    //SAMPLE DATA
    //Devra etre remplacé par les fetch des data
    // ==================================
    // ====== Fonction fin d'étape ======
    // ==================================
    switch (action) {
        //Avancez à la case X
        case "0":
            textBox.innerText = `Avancez à la case ${activeStep.endStepWin}`
            break;

        //Restez à la case X
        case "1":
            textBox.innerText = `Restez à la case ${activeStep.endStepStill}`
            break;

        //Reculez à la case X
        case "2":
            textBox.innerText = `Reculez à la case ${activeStep.endStepLoose}`
            break;

        //Avancez à la case X, mais continuez votre tour
        case "3":
            textBox.innerText = `Avancez à la case ${activeStep.endStepContinue} et continuez votre tour.`
            break;
    }

    textBox.addEventListener('click', () => {
        menuView()
    })
}