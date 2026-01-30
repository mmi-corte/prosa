import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { characterSelectView } from "./characterSelectView.js";

let playerCount

export function playerCountView() {
    clearInitContainer();
    initContainer.classList.add('initScreen1');
    initTextContainer.innerText = "Veuillez entrer le nombre de joueurs";

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

    playerCountContainer.append(plusButton, playerCountInput, minusButton);

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
        console.log(playerCount)
        characterSelectView(playerCount);
    });
}