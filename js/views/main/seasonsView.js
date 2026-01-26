import { gameContainer } from "../../../app.js"

export function seasonsView() {
    const container = document.createElement('div')
    container.classList.add('modal-overlay', 'coming-soon-modal')

    container.innerHTML = `
        <button class="close-btn close-detail" id="closeModal" aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
        </button>
        <div class="coming-soon-content">
            <h2>À venir</h2>
            <p>Cette fonctionnalité sera bientôt disponible.</p>
        </div>
    `

    gameContainer.appendChild(container)

    const closeModal = document.getElementById('closeModal')
    closeModal.addEventListener('click', () => {
        window.history.back();
        container.remove()
    })
}