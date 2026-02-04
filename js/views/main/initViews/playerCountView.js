import { navigate } from "../../../../app.js";
import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { characterSelectView } from "./characterSelectView.js";
import { gameInitialized } from "../../../initGame.js";
import { menuView } from "../menuView.js";

let playerCount

export function playerCountView() {
    console.log('playerCountView called, gameInitialized:', gameInitialized)

    if (gameInitialized) {
        console.log('Game already initialized, redirecting to menu')
        navigate('menu', menuView, true)
        return
    }
    
    console.log('Starting player count view')

    clearInitContainer();
    initContainer.classList.add('initScreen1');
    initTextContainer.innerText = "Nombre de joueurs";

    playerCount = 2;

    const playerCountContainer = document.createElement('div');
    playerCountContainer.classList.add('playerCountContainer');
    initContainer.appendChild(playerCountContainer);

    // --- Controls ---
    const plusButton = document.createElement('button');
    plusButton.innerHTML = "+";

    const minusButton = document.createElement('button');
    minusButton.innerHTML = "-";

    const playerCountInput = document.createElement('span');
    playerCountInput.innerHTML = playerCount;

    playerCountContainer.append(minusButton, playerCountInput, plusButton);

    // --- Submit Button ---
    const submitButton = document.createElement('button');
    submitButton.classList.add("btn-primary")
    submitButton.innerText = "Valider";
    initContainer.appendChild(submitButton);

    // --- Event Listeners ---
    plusButton.addEventListener('click', () => {
        if (playerCount < 6) {
            playerCount++;
            playerCountInput.innerHTML = playerCount;
        }
    });

    minusButton.addEventListener('click', () => {
        if (playerCount > 2) {
            playerCount--;
            playerCountInput.innerHTML = playerCount;
        }
    });

    submitButton.addEventListener('click', () => {
        navigate('choix-personnage', () => characterSelectView(playerCount), true)
    });
}
