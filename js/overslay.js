export function addOverlay(texte)
{
    //Overlay Transition
    const fightContainer = document.getElementsByClassName('fightContainer')[0];   
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    fightContainer.appendChild(overlay);
    console.log(texte)


}