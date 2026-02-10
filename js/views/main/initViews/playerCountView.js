import { clearInitContainer, initContainer, initPlayerCount, initTextContainer, setInitPlayerCount } from "../initView.js";
import { characterSelectView } from "./characterSelectView.js";
import { gameInitialized } from "../../../initGame.js";
import { menuView } from "../menuView.js";
import { navigate } from "../../../../router.js";
import { removeBackButton, showBackButton } from "../../components/backButton.js";

export function playerCountView() {
    removeBackButton()
    showBackButton()
    if (gameInitialized) {
        console.log('Game already initialized, redirecting to menu')
        navigate('menu', menuView, true)
        return
    }

    clearInitContainer();
    initContainer.classList.add('initScreen1');
    initTextContainer.innerText = "Nombre de joueurs";

    const playerCountContainer = document.createElement('div');
    playerCountContainer.classList.add('playerCountContainer');
    initContainer.appendChild(playerCountContainer);

    // --- Controls ---
    const plusButton = document.createElement('button');
    plusButton.innerHTML = "+";

    const minusButton = document.createElement('button');
    minusButton.innerHTML = "-";

    const playerCountInput = document.createElement('span');
    playerCountInput.innerHTML = initPlayerCount;

    playerCountContainer.append(minusButton, playerCountInput, plusButton);

    // --- Submit Button ---
    const submitButton = document.createElement('button');
    submitButton.classList.add("btn-primary")
    submitButton.innerText = "Valider";
    initContainer.appendChild(submitButton);

    // --- Event Listeners ---
    plusButton.addEventListener('click', () => {
        if (initPlayerCount < 6) {
            setInitPlayerCount(initPlayerCount + 1);
            playerCountInput.innerHTML = initPlayerCount;
        }
    });

    minusButton.addEventListener('click', () => {
        if (initPlayerCount > 2) {
            setInitPlayerCount(initPlayerCount - 1);
            playerCountInput.innerHTML = initPlayerCount;
        }
    });

    submitButton.addEventListener('click', () => {
        navigate('nouvelle-partie/choix-personnage', () => characterSelectView(initPlayerCount), true)
    });
}
