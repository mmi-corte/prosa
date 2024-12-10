export function addForm(containerID) {
    // Sélectionne la div par son ID
    const container = document.getElementById(containerID);
    
    // Vérifie si la div existe
    if (!container) {
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }

    // Création d'un formulaire
    const form = document.createElement('form');
    form.className = 'form'; // Définir la classe du formulaire
    form.id = 'formUser';

    // Création d'un champ de saisie
    const input = document.createElement('input');
    input.type = 'text'; // Définir le type de champ
    input.placeholder = 'Entrez votre texte ici'; // Ajouter un texte gris
    input.name = 'userInput'; // Nom du champ pour une meilleure gestion des données

    // Création d'un bouton submit
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit'; // Type de bouton
    submitBtn.className ="btn";
    submitBtn.id = "btnSubmit";
    submitBtn.textContent = 'Valider'; // Texte affiché sur le bouton

    // Ajouter le champ et le bouton au formulaire
    form.appendChild(input);
    form.appendChild(submitBtn);

    // Ajouter le formulaire à la div
    container.appendChild(form);
}