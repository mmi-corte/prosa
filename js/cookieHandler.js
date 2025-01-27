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

// Fonction pour définir un cookie
export function setCookie(name, value, days = 7, path = '/') {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));  // Calculer la date d'expiration
    const expiresString = "expires=" + expires.toUTCString();  // Formater la date d'expiration en UTC
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expiresString}; path=${path}`;  // Définir le cookie
}