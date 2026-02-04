import { clearInitContainer, initContainer, initTextContainer } from "../initView.js";
import { playerCountView } from "./playerCountView.js";
import { menuView } from "../menuView.js";
import { navigate, headerLeft } from "../../../../app.js";
import { gameInitialized, setDifficulty } from "../../../initGame.js";
import { resetDifficultyIndicator } from "../../components/difficultyIndicator.js";

let selectedDifficulty = null;

export function difficultyView() {
    resetDifficultyIndicator()
    
    if (gameInitialized) {
        navigate('menu', menuView())
        return
    }

    clearInitContainer();
    initContainer.classList.add('initScreen1');
    initTextContainer.innerHTML = `
        <span style="font-size: 2rem; font-weight: 900;">NOMBRE D’ERREURS MAXIMAL</span><br>
        <span style="font-size: 1.2rem; font-weight: 400; color: var(--muted-foreground);">Choisissez votre jauge</span>
    `;

    // Container pour les jauges
    const difficultyContainer = document.createElement('div');
    difficultyContainer.classList.add('difficulty-container');

    // Créer les 3 jauges
    const difficulties = [
        { value: 30, label: 'FACILE', height: '85%' },
        { value: 20, label: 'NORMAL', height: '65%' },
        { value: 10, label: 'DIFFICILE', height: '45%' }
    ];

    difficulties.forEach(diff => {
        const gaugeWrapper = document.createElement('div');
        gaugeWrapper.classList.add('difficulty-gauge-wrapper');

        const gauge = document.createElement('div');
        gauge.classList.add('difficulty-gauge');
        gauge.style.height = diff.height;
        gauge.dataset.value = diff.value;

        const valueLabel = document.createElement('div');
        valueLabel.classList.add('gauge-value');
        valueLabel.textContent = diff.value;

        const textLabel = document.createElement('div');
        textLabel.classList.add('gauge-label');
        textLabel.textContent = diff.label;

        gauge.addEventListener('click', () => {
            selectedDifficulty = diff.value;
            // Enlever la classe selected de toutes les jauges
            document.querySelectorAll('.difficulty-gauge').forEach(g => g.classList.remove('selected'));
            // Ajouter la classe selected à la jauge cliquée
            gauge.classList.add('selected');
            //Update la difficulté du jeu
            setDifficulty(selectedDifficulty)
            // Afficher le bouton Continuer
            submitButton.style.opacity = '1';
        });

        gauge.appendChild(valueLabel);
        gaugeWrapper.appendChild(gauge);
        gaugeWrapper.appendChild(textLabel);
        difficultyContainer.appendChild(gaugeWrapper);
    });

    initContainer.appendChild(difficultyContainer);

    // Bouton retour (header)
    if (headerLeft && !headerLeft.querySelector('.back-btn-circle')) {
        const backButton = document.createElement('button');
        backButton.classList.add('back-btn-circle');
        backButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        `;
        backButton.addEventListener('click', () => {
            navigate('menu', menuView(), true);
        });
        headerLeft.appendChild(backButton);
    }

    // Bouton submit caché au départ
    const submitButton = document.createElement('button');
    submitButton.classList.add('btn-primary', 'difficulty-continue-btn');
    submitButton.innerText = 'Continuer';
    submitButton.style.opacity = '0';
    submitButton.addEventListener('click', () => {
        if (selectedDifficulty) {
            navigate('nombre-joueur', playerCountView())
        }
    });

    initContainer.appendChild(submitButton);

    // Afficher automatiquement la modal au premier chargement
    setTimeout(() => {
        showInfoModal();
    }, 300);
}


function showInfoModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content', 'difficulty-info-modal');

    modalContent.innerHTML = `
        <button class="close-btn" id="closeInfoModal" aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>

        <h2 style="font-size: 2rem; font-weight: 900; margin-bottom: 20px; text-align: center;">INFOS</h2>

        <p style="margin-bottom: 20px; line-height: 1.6;">
            La jauge de difficulté va avoir une influence directe sur la difficulté de votre jeu.
        </p>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <p><strong>Le niveau facile 30 :</strong> Plus de temps pour les énigmes et indices supplémentaires</p>
            <p><strong>Le niveau normal 20 :</strong> Temps standard et difficulté équilibrée</p>
            <p><strong>Le niveau difficile 10 :</strong> Moins de temps et aucune aide disponible</p>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const closeBtn = document.getElementById('closeInfoModal');
    closeBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// export function getDifficulty() {
//     return parseInt(localStorage.getItem('gameDifficulty')) || 20;
// }
