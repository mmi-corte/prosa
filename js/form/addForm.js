export function addForm(containerID) {
    // Sélectionne la div par son ID
    const container = document.getElementById(containerID);
    

    //verifi si la div existe
    if (!container) {
        console.error(`Aucune div trouvée avec l'id "${containerID}"`);
        return;
    }

    // Création d'un formulaire
    const form = document.createElement('form');

    // Création d'un champ de saisie
    const input = document.createElement('input');
    input.type = 'text'; // Définir le type de champ
    input.placeholder = 'Entrez votre pseudo'; // Ajouter le texte gris
    
    // Ajouter le champ au formulaire
    form.appendChild(input);

    // Ajouter le formulaire a la div
    container.appendChild(form);
}