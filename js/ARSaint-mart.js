export function setupARScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Le conteneur avec l'ID ${containerId} n'existe pas.`);
        return;
    }

    // Crée la structure HTML de la scène AR
    container.innerHTML = `
        <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;" cursor="rayOrigin:mouse">
            <!-- Audio -->
            <audio id="soundtrack" src="https://cdn.glitch.me/2333a1fb-6837-486d-9b68-0315daf74449/Top%20hits%202024%20playlist%20%20~%20Trending%20music%202024%20~%20Best%20songs%202024%20updated%20weekly%20(Playlist%20Hits).mp3?v=1733924705198" preload="auto"></audio>

            <!-- Images AR -->
            <a-image 
              src="https://cdn.glitch.global/2333a1fb-6837-486d-9b68-0315daf74449/chat.png?v=1733407555000" 
              position="0 1.28 -1"  
              rotation="0 0 0" 
              scale="0.5 0.5 0.5"
              transparent="true"
              material="alphaTest: 0.5">
            </a-image> 

            <a-image
              src="https://cdn.glitch.global/2333a1fb-6837-486d-9b68-0315daf74449/sainte_marthe.png?v=1733407548940" 
              position="0 1 -2"  
              rotation="0 0 0" 
              scale="1 1 1"
              transparent="true"
              material="alphaTest: 0.5">
            </a-image> 

            <a-image
              src="https://cdn.glitch.global/2333a1fb-6837-486d-9b68-0315daf74449/soleil_sainte_marthe.png?v=1733407551478" 
              position="0 0.85 -3.5"      
              rotation="0 0 0" 
              scale="1 1 1"
              transparent="true"
              material="alphaTest: 0.5">
            </a-image>
            
            <!-- Boîte de dialogue -->
            <a-entity position="0 1 -1" scale="0.25 0.25 0.25">
                <a-plane 
                  position="0 0 0" 
                  width="1.5" 
                  height="0.5" 
                  color="grey" 
                  material="opacity: 0.8; transparent: true" 
                  rotation="0 0 0">
                </a-plane>
                <a-text 
                  value="Salut moi c'est la Sainte Marthe" 
                  position="0 0 0.01" 
                  align="center" 
                  color="#000000" 
                  width="1.5"
                  wrapCount="15">
                </a-text>
            </a-entity>

            <a-entity cursor="rayOrigin:mouse"></a-entity>
        </a-scene>
    `;
}

export function setupAudioControls() {
    // Récupérer les éléments nécessaires
    const soundtrack = document.getElementById('soundtrack');
    if (!soundtrack) {
        console.error('L\'audio "soundtrack" est introuvable.');
        return;
    }

    // Ajout de l'écouteur pour activer le son
    const startButton = document.createElement('button');
    startButton.id = 'startSound';
    startButton.textContent = 'Activer le son';
    startButton.style.position = 'absolute';
    startButton.style.top = '20px';
    startButton.style.left = '20px';
    startButton.style.zIndex = 10;
    document.body.appendChild(startButton);

    startButton.addEventListener('click', () => {
        soundtrack.play()
            .then(() => {
                console.log("Lecture du son démarrée.");
                startButton.style.display = 'none'; // Masquer le bouton après activation
            })
            .catch(err => {
                console.error("Impossible de lire le son :", err);
            });
    });

    // Lecture automatique si possible
    document.querySelector('a-scene').addEventListener('loaded', () => {
        console.log("Scène chargée, tentative de lecture automatique du son.");
        soundtrack.play().catch(err => {
            console.log("Lecture automatique bloquée, nécessite une interaction utilisateur.");
        });
    });

}
