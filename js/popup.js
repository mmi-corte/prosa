export function popup(txt, imgSrc)
{

    //Overlay Transition
    const Container = document.getElementById('container');   
    const overlay = document.createElement("div");
    const OverlayText = document.createElement("p");
    const OverlayImage = document.createElement("img");
    overlay.className = "overlay";
    Container.appendChild(overlay);

    function fadeIn(element) {
        element.classList.remove("fade-out");
        element.classList.add("fade-in");
        element.style.display = "flex"; // Rendre visible si nécessaire
    }
    
    function fadeOut(element) {
        element.classList.remove("fade-in");
        element.classList.add("fade-out");
        setTimeout(() => {
        element.style.display = "none"; // Cache l'élément après l'animation
        }, 2000); // La durée doit correspondre à celle de l'animation CSS
    }



    fadeIn(overlay);
    
    setTimeout(() => {
        fadeOut(overlay);
    }, 3000);


    OverlayImage.className = "OverlayImg";
    OverlayImage.src = imgSrc;
    overlay.appendChild(OverlayImage);
    
    OverlayText.className = "OverlayTxt";
    OverlayText.innerHTML = txt+" obtenu(e) !";
    overlay.appendChild(OverlayText);
}