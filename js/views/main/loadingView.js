import { gameContainer } from "../../../app.js"

export function loadingView() {
    const container = document.createElement('div')
    container.classList.add('loading-screen')

    container.innerHTML = `
        <div class="loading-content">
        <div class="logo-container">
            <!-- Logo PROSA officiel -->
            <img src="./assets/logo/prosa-logo.png" alt="PROSA" class="logo-main" />
        </div>
        <!-- Serpent spirale comme icône de chargement -->
        <div class="spinner-spiral">
            <img src="f./assets/logo/chargement.png" alt="Chargement" class="spiral-img" />
        </div>
        </div>
        <div class="fun-fact-card">
        <h3>Le saviez-vous ?</h3>
        <p id="funFactText">
            <em>En Corse, on dit qu'un serpent à sept têtes gardait une source
            sacrée et qu'aucun berger n'osait s'en approcher.</em>
        </p>
        </div>
    `

    gameContainer.appendChild(container)

    let funFacts = [
        "En Corse, on dit qu'un serpent à sept têtes gardait une source sacrée et qu'aucun berger n'osait s'en approcher.",
        "L'Orcu est une créature mythique corse qui fait passer les voyageurs d'un monde à l'autre.",
        "Les bergers corses gardent jalousement la recette secrète du Brocciu depuis des siècles.",
        "Dans les montagnes corses, on raconte que certaines pierres murmurent des secrets aux initiés."
    ]

    function initLoadingScreen() {
        const funFactText = document.getElementById("funFactText")
        const loadingScreen = container // assuming container is the loading screen div

        if (!funFacts.length) {
            funFactText.textContent = "Chargement..."
            setTimeout(() => {
                container.classList.add("hidden")
            }, 3000)
            return
        }

        let factIndex = 0
        funFactText.innerHTML = `<em>${funFacts[factIndex]}</em>`

        const factInterval = setInterval(() => {
            factIndex = (factIndex + 1) % funFacts.length
            funFactText.innerHTML = `<em>${funFacts[factIndex]}</em>`
        }, 2000) // Change fact every 2 seconds

        setTimeout(() => {
            clearInterval(factInterval)
            container.classList.add("hidden")
        }, 3000) //Delay
    }
    initLoadingScreen()

}