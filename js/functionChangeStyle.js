
export function changeStyleBG(conatinerId) {
    const element = document.getElementById(conatinerId);
    element.style.background = "none";
    element.style.backgroundColor = "transparent";
    element.style.backgroundImage = "none";

}
export function changeStyleBGB(conatinerId){
    const element = document.getElementById(conatinerId);
    element.style.backgroundColor = 'black';
}

export function selectAvatar(allAvatars) {
    const avatarContainer = document.getElementById("imgAvatarContainer");

    allAvatars.forEach(avatar => {
        avatar.addEventListener("click", function () {
            // Réinitialise le style de toutes les images
            allAvatars.forEach(otherAvatar => {
                otherAvatar.style.border = '';
                otherAvatar.style.filter = '';
            });

            // affect the skin global variable
            let skin = avatar.id;

            // Met à jour la variable skin dans le localStorage
            localStorage.setItem("skin", skin);

            // Met à jour l'attribut `data-selected-avatar`
            avatarContainer.setAttribute("data-selected-avatar", skin);

            // Applique le style cliqué uniquement à l'image sélectionnée
            avatar.style.border = '4px solid #9AAB5C';
            //avatar.style.filter = 'brightness(0.8)';
        });
    });
}

export function selectButton(allButtons) {
    allButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Réinitialise le style de tous les boutons
            allButtons.forEach(otherButton => {
                otherButton.style.backgroundColor = '';  // Réinitialiser la couleur de fond
                          // Réinitialiser la couleur du texte
            });

            // Applique un style cliqué uniquement au bouton sélectionné
            button.style.backgroundColor = '#9AAB5C';  // Exemple de fond
           
        });
    });
}
