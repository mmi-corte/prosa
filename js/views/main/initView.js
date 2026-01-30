import { clearContainer, gameContainer } from "../../../app.js";
import { characterSelectView } from "./initViews/characterSelectView.js";
import { playerCountView } from "./initViews/playerCountView.js";

export let wrapper;
export let initTextContainer;
export let initContainer;

export let initPlayerCount

export function initView() {
    clearContainer();

    wrapper = document.createElement('div');
    wrapper.classList.add('initWrapper');
    gameContainer.append(wrapper);

    initTextContainer = document.createElement('p');
    wrapper.appendChild(initTextContainer);

    initContainer = document.createElement('div');
    initContainer.classList.add('initScreen1');
    wrapper.appendChild(initContainer)

    // Load first setting screen
    playerCountView()
}

export function clearInitContainer() {
    if (initContainer) {
        initContainer.classList.remove(...initContainer.classList)
        initTextContainer.innerHTML = null
        initContainer.innerHTML = null;
    }
}