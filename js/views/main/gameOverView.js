import { gameContainer, clearContainer } from "../../../app.js";
import { navigate } from "../../../router.js";
import { resetGame } from "../../initGame.js";
import { initView } from "./initView.js";

export function gameOverView() {
    // Vider le conteneur
    clearContainer()

    // Créer le wrapper dans le style du menu
    gameContainer.innerHTML = `
        <div class="menuWrapper game-over-wrapper">
            <div class="game-over-content">
                <h1 class="game-over-title">PARTIE<br>TERMINÉE</h1>
                <p class="game-over-question">Souhaitez-vous refaire<br>une partie ?</p>
                
                <div class="game-over-buttons">
                    <button class="game-over-choice game-over-yes" id="yesBtn">
                        OUI
                    </button>
                    <button class="game-over-choice game-over-no" id="noBtn">
                        NON
                    </button>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('yesBtn').addEventListener('click', () => {
        resetGame();
        navigate('init', initView);
    });

    document.getElementById('noBtn').addEventListener('click', () => {
        // Retour à l'accueil ou menu principal (relative so subpath deployments work)
        resetGame();
        window.location.href = './index.html#menu';
    });
}

// Fonction pour vérifier si le joueur a perdu
export function checkGameOver(difficultyState) {
    if (difficultyState <= 0) {
        navigate('gameover', gameOverView, true);
        return true;
    }
    return false;
}
