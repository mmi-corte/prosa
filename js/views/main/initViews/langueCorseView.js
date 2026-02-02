import { gameContainer } from "../../../../app.js";
import { setLanguage } from "../../../langageManager.js";
import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { characterSelectView } from "./characterSelectView.js";

export function langueCorseView(playerCount) {
    console.log("Language selection view loaded");
    clearInitContainer();
    initContainer.classList.add('initScreen1-5'); // A language selection screen

    initTextContainer.innerHTML = "Choisissez votre langue / Scegliete a vostra lingua";

    // Create a container for language buttons
    const languageButtonsContainer = document.createElement('div');
    languageButtonsContainer.classList.add('language-buttons-container');
    initContainer.appendChild(languageButtonsContainer);

    // French button
    const frenchBtn = document.createElement('button');
    frenchBtn.classList.add('language-btn', 'french-btn');
    frenchBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M2 12h20" />
        </svg>
        <span>Français</span>
    `;
    frenchBtn.addEventListener('click', () => {
        setLanguage('fr');
        console.log('French selected');
        characterSelectView(playerCount);
    });

    // Corsican button
    const corsicBtn = document.createElement('button');
    corsicBtn.classList.add('language-btn', 'corsican-btn');
    corsicBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M2 12h20" />
        </svg>
        <span>Corsu</span>
    `;
    corsicBtn.addEventListener('click', () => {
        setLanguage('cor');
        console.log('Corsican selected');
        characterSelectView(playerCount);
    });

    languageButtonsContainer.appendChild(frenchBtn);
    languageButtonsContainer.appendChild(corsicBtn);
}
