
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

window.onload = function() {
     // Exécuter la fonction lors du chargement de la page
     if (isMobileDevice()) {
        console.log("Vous utilisez un appareil mobile.");
        // Ici, vous pouvez ajouter d'autres actions spécifiques pour les appareils mobiles
    } else {
        console.log("Vous utilisez un ordinateur de bureau.");
        // Ici, vous pouvez ajouter d'autres actions spécifiques pour les ordinateurs
    }
}

