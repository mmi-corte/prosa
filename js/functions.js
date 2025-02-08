
// Fonction pour détecter si l'appareil est mobile ou non
export function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export function checkImageExists(url, callback) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
}   

function goFullscreen() {
    const element = document.documentElement; // Prendre l'élément HTML entier
    if (element.requestFullscreen) {
        element.requestFullscreen(); // Fullscreen standard
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE
        element.msRequestFullscreen();
    } else {
        console.error('Le navigateur ne prend pas en charge le mode plein écran');
    }
}

window.onload = () => {
     // Exécuter la fonction lors du chargement de la page
     if (isMobileDevice()) {
        console.log("Vous utilisez un appareil mobile.");
        // Ici, vous pouvez ajouter d'autres actions spécifiques pour les appareils mobiles
        goFullscreen(); // Appeler la fonction de plein écran lorsque la page est chargée
    } else {
        console.log("Vous utilisez un ordinateur de bureau.");
        // Ici, vous pouvez ajouter d'autres actions spécifiques pour les ordinateurs
    }
}