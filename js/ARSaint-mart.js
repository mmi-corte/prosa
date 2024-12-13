export function setupARScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Le conteneur avec l'ID ${containerId} n'existe pas.`);
        return;
    }

    // Crée la structure HTML de la scène AR
    container.innerHTML = `
        <a-scene 
            embedded 
            arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best; sourceWidth: 1280; sourceHeight: 720"
            cursor="rayOrigin:mouse">
            
            <!-- Audio -->
            <audio id="soundtrack" 
                   src="https://cdn.glitch.me/2333a1fb-6837-486d-9b68-0315daf74449/Top%20hits%202024%20playlist%20~%20Trending%20music%202024%20~%20Best%20songs%202024%20updated%20weekly%20(Playlist%20Hits).mp3?v=1733924705198" 
                   preload="auto"></audio>

            <!-- Images AR -->
            <a-image id="image1"
                src="https://cdn.glitch.global/2333a1fb-6837-486d-9b68-0315daf74449/chat.png?v=1733407555000" 
                position="0 1 -2" 
                rotation="0 0 0" 
                scale="0.5 0.5 0.5"
                transparent="true"
                material="alphaTest: 0.5">
            </a-image> 

            <a-image id="image2"
                src="https://cdn.glitch.global/2333a1fb-6837-486d-9b68-0315daf74449/sainte_marthe.png?v=1733407548940" 
                position="0 1.5 -3"  
                rotation="0 0 0" 
                scale="1 1 1"
                transparent="true"
                material="alphaTest: 0.5">
            </a-image> 

            <a-image id="image3"
                src="https://cdn.glitch.global/2333a1fb-6837-486d-9b68-0315daf74449/soleil_sainte_marthe.png?v=1733407551478" 
                position="0 2 -4"      
                rotation="0 0 0" 
                scale="1 1 1"
                transparent="true"
                material="alphaTest: 0.5">
            </a-image>

            <!-- Caméra -->
            <a-camera position="0 0 0" fov="50"></a-camera>
        </a-scene>

        <!-- Interface pour contrôler la position -->
        <div style="position: absolute; top: 20px; left: 20px; z-index: 10;">
            <label for="positionX">Position X:</label>
            <input id="positionX" type="number" value="0">
            <br>

            <label for="positionY">Position Y:</label>
            <input id="positionY" type="number" value="1">
            <br>

            <label for="positionZ">Position Z:</label>
            <input id="positionZ" type="number" value="-2">
            <br>

            <button id="updatePosition">Mettre à jour la position</button>
        </div>
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
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', () => {
            console.log("Scène chargée, tentative de lecture automatique du son.");
            soundtrack.play().catch(err => {
                console.log("Lecture automatique bloquée, nécessite une interaction utilisateur.");
            });
        });
    }
}

export function setupPositionControls() {
    const updateButton = document.getElementById('updatePosition');
    const positionX = document.getElementById('positionX');
    const positionY = document.getElementById('positionY');
    const positionZ = document.getElementById('positionZ');
    
    const image1 = document.getElementById('image1');
    const image2 = document.getElementById('image2');
    const image3 = document.getElementById('image3');
    
    if (!image1 || !image2 || !image3) {
        console.error("Les images AR n'ont pas été trouvées.");
        return;
    }

    updateButton.addEventListener('click', () => {
        const newPosX = positionX.value;
        const newPosY = positionY.value;
        const newPosZ = positionZ.value;

        // Mettre à jour les positions des images
        image1.setAttribute('position', `${newPosX} ${newPosY} ${newPosZ}`);
        image2.setAttribute('position', `${newPosX} ${parseFloat(newPosY) + 1} ${parseFloat(newPosZ) - 1}`);
        image3.setAttribute('position', `${newPosX} ${parseFloat(newPosY) + 2} ${parseFloat(newPosZ) - 2}`);
    });
}
