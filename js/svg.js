export function addSVG(container, svgCode, className = '') {
    // Vérifie si le conteneur est un élément HTML valide
    const containerElement = document.getElementById(container);

    // Crée un élément div temporaire pour insérer le code SVG
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgCode.trim();

    // Récupère l'élément SVG depuis la div temporaire
    const svgElement = tempDiv.firstChild;

    // Vérifie que le contenu est bien un élément SVG
    if (!(svgElement instanceof SVGElement)) {
        console.error("Le code fourni n'est pas un SVG valide.");
        return;
    }

    // Ajoute la classe si fournie
    if (className) {
        svgElement.classList.add(className);
    }

    // Ajoute l'élément SVG au conteneur
    containerElement.appendChild(svgElement);
}