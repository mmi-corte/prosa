import { clearContainer, gameContainer } from "../../../app.js";
import { activeStepId, callAction } from "../../gameEventHandler.js";
import { tokensData } from "../../loadData.js";

export function tokenView(action) {
    const data = tokensData[action]

    const wrapper = document.createElement('div')
    wrapper.classList.add('endWrapper')
    gameContainer.appendChild(wrapper)

    const textIndication = document.createElement('div')
    textIndication.classList.add('text_indication')

    const textNumber = document.createElement('div')
    textNumber.classList.add('next_step')

    wrapper.appendChild(textIndication)
    wrapper.appendChild(textNumber)

    // Set text based on token type
    const tokenNumber = parseInt(data.number) || 1
    const tokenText = tokenNumber > 1 ? "jetons" : "jeton"

    switch (data.type) {
        case "lose":
            textIndication.innerText = "Vous perdez"
            textNumber.innerText = `${tokenNumber} ${tokenText}`
            break;
        case "win":
            textIndication.innerText = "Vous gagnez"
            textNumber.innerText = `${tokenNumber} ${tokenText}`
            break;
        default:
            console.error(`Unknown token type: ${data.type}`)
    }

    setTimeout(() => wrapper.classList.add("show"), 10)

    let listenerAdded = false
    const addClickListener = () => {
        if (listenerAdded) return
        listenerAdded = true
        wrapper.addEventListener('click', () => {
            callAction(data.nextActionType, data.nextAction)
        })
    }

    const minDelay = 800
    wrapper.addEventListener('transitionend', () => {
        setTimeout(addClickListener, minDelay)
    }, { once: true })
    // Fallback in case there is no transition
    setTimeout(addClickListener, minDelay + 150)
}