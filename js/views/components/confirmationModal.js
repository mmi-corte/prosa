import { navigate } from "../../../router.js";

/**
 * Affiche un modal de confirmation avant de quitter la progression
 * @param {string} targetRoute - La route vers laquelle naviguer si confirmé
 * @param {Function} onConfirm - Callback optionnel avant la navigation
 */
export function showConfirmationModal(targetRoute, targetFunction, onConfirm = null) {
    // Créer l'overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    
    // Créer le contenu du modal
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content', 'confirmation-modal');
    
    modalContent.innerHTML = `
        <h2>Êtes-vous sûr ?</h2>
        <h3>Quitter la progression ?</h3>
        <p style="color: var(--muted-foreground); margin-top: 20px; margin-bottom: 30px;">
            Les informations saisies ne seront pas enregistrées.
        </p>
        <div class="confirmation-buttons">
            <button id="confirmBtn" class="btn-confirm" style="background: var(--accent-red); color: white; width: 100%; padding: 16px; border-radius: 8px; border: none; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-bottom: 12px;">Quitter</button>
            <button id="cancelBtn" class="btn-cancel" style="background: var(--card); color: var(--foreground); width: 100%; padding: 16px; border-radius: 8px; border: 1px solid var(--border); font-size: 1.1rem; font-weight: 600; cursor: pointer;">Annuler</button>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Ajouter les styles au modal
    const h2 = modalContent.querySelector('h2');
    const h3 = modalContent.querySelector('h3');
    h2.style.fontSize = '1.5rem';
    h2.style.fontWeight = '600';
    h2.style.marginBottom = '8px';
    h2.style.color = 'var(--foreground)';
    h3.style.fontSize = '1.2rem';
    h3.style.fontWeight = '600';
    h3.style.color = 'var(--foreground)';
    h3.style.margin = '0 0 20px 0';
    
    // Récupérer les boutons
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Hover effects
    confirmBtn.addEventListener('mouseenter', () => {
        confirmBtn.style.background = '#a82428';
    });
    confirmBtn.addEventListener('mouseleave', () => {
        confirmBtn.style.background = 'var(--accent-red)';
    });
    
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = 'var(--muted)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'var(--card)';
    });
    
    // Événement de confirmation
    confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        modalOverlay.remove();
        navigate(targetRoute, targetFunction);
    });
    
    // Événement d'annulation
    cancelBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    // Fermer en cliquant en dehors (optionnel)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}
