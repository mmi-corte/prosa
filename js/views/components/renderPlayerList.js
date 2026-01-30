import { fetchPlayerCharacters } from "../../loadData.js"

let charactersData

/**
 * Fonction d'appel d'action
 * @param  {[object]} container Conteneur parent
 * @param  {[object]} players Liste des joueurs
 * @param  {[boolean]} interact Nécessite une interaction au clic ?
 */
export async function renderPlayerList(container, players, interact = false, onSelect = null) {
    const playerList = document.createElement('div')
    playerList.classList.add('playerList')
    container.appendChild(playerList)

    charactersData = await fetchPlayerCharacters()

    players.forEach((player, playerIndex) => {
        const playerCard = document.createElement('button')
        playerList.appendChild(playerCard)
        playerCard.style.setProperty('--bg-image', `url(./assets/playersCharacters/wide_${charactersData[player.localisation][player.character].image})`)

        const textContainer = document.createElement('div')
        playerCard.appendChild(textContainer)

        //Text
        const playerName = document.createElement('span')
        playerName.innerText = `Joueur ${playerIndex + 1}`

        const characterName = document.createElement('p')
        characterName.innerText = charactersData[player.localisation][player.character].name

        textContainer.append(playerName, characterName)

        if (interact && typeof onSelect === 'function') {
            playerCard.style.cursor = "pointer"
            playerCard.addEventListener('click', () => {
                onSelect(playerIndex)
            })
        }
    });
}