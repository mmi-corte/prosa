// Vérifier si un cookie spécifique existe
export function isCookiePresent(name) {
    return getCookie(name) !== "";  // Si la fonction getCookie renvoie une chaîne vide, le cookie n'est pas présent
}

export function getCookieValue(name) {
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match[2] : null;
}

// Fonction pour obtenir la valeur d'un cookie par son nom
export function getCookie(name) {
    let decodedCookie = decodeURIComponent(document.cookie);  // Décoder les cookies
    let cookiesArray = decodedCookie.split(';');  // Séparer tous les cookies

    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();  // Enlever les espaces
        if (cookie.indexOf(name + "=") == 0) {  // Vérifier si le cookie commence par le nom donné
            return cookie.substring(name.length + 1, cookie.length);  // Retourner la valeur du cookie
        }
    }
    return "";  // Retourne une chaîne vide si le cookie n'est pas trouvé
}
