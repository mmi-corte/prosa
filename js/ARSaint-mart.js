//import { loadSound, } from './Sound/sound.js';

export function setupARScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Le conteneur avec l'ID ${containerId} n'existe pas.`);
        return;
    }

    // Crée la structure HTML de la scène AR
    container.innerHTML = `
        <a-scene embedded arjs="debugUIEnabled: false; smooth: true; smoothCount: 10; smoothTolerance: 0.01; smoothThreshold: 5;" 
             renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; sortObjects: true;">
      <a-assets>
        <audio id="sound" src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/MACKLEMORE%20%26%20RYAN%20LEWIS%20-%20THRIFT%20SHOP%20FEAT.%20WANZ%20(OFFICIAL%20VIDEO).mp3?v=1734185236152" preload="auto"></audio>
      </a-assets>

      <a-marker id="marker" preset="pattern" type="pattern" url="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/ProsaQrCode1Test.patt?v=1734096265996">
        <!-- premier plan  (en avant) -->
        <a-image 
          src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega2-premier%20plan.png?v=1734341061681" 
          position="0 0 0" 
          rotation="-90 0 0" 
          scale="10 10 10"
          material="transparent: true; alphaTest: 0.5;">
        </a-image>

        <!-- deuxième plan (un peu plus loin) -->
        <a-image
          src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega2-sujet%20(milieu).png?v=1734341063827" 
          position="0 -0.5 0" 
          rotation="-90 0 0" 
          scale="10 10 10"
          material="transparent: true; alphaTest: 0.5;">
        </a-image>

        <!-- troisième plan (encore plus loin) -->
        <a-image 
          src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega2-background%20maison.png?v=1734341057146" 
          position="0 -1 0" 
          rotation="-90 0 0" 
          scale="10 10 10"
          material="transparent: true; alphaTest: 0.5;">
        </a-image>
        <!-- quatrième plan (le plus éloigné) -->
        <a-image
          src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/a%20strega3-background%20soleil.png?v=1734341748536" 
          position="0 -1.5 -0.5" 
          rotation="-90 0 0" 
          scale="10 10 10"
          material="transparent: true; alphaTest: 0.5;">
        </a-image>

        <!-- Boîte de dialogue -->
        <a-plane 
          position="0 0 8" 
          rotation="-90 0 0" 
          scale="8 8 8"
          width="1.5" 
          height="0.5" 
          color="grey" 
          material="opacity: 0.8; transparent: true">
        </a-plane>
        <a-text 
          value="Salut moi c'est la Strega" 
          rotation="-90 0 0" 
          scale="8 8 8" 
          position="0 0 8" 
          align="center" 
          color="#000000" 
          width="1.5" 
          wrapCount="15">
        </a-text>
      </a-marker>

      <a-entity sound="src: #sound; autoplay: false; loop: true;" id="audioEntity"></a-entity>
      <a-entity camera position="0 0 0"></a-entity>
    </a-scene>

    `;
}

export function setupAudioControls() {
    // Composant pour ajuster le volume selon la distance
    AFRAME.registerComponent('soundhandler', {
      init: function () {
        const marker = document.querySelector('#marker');
        const soundEntity = document.querySelector('#audioEntity');
        const camera = document.querySelector('[camera]');

        // Surveille la visibilité du marqueur
        marker.addEventListener('markerFound', () => {
          console.log('Marqueur détecté, lancement du son.');
          soundEntity.components.sound.playSound();
        });

        marker.addEventListener('markerLost', () => {
          console.log('Marqueur perdu, pause du son.');
          soundEntity.components.sound.pauseSound();
        });

        // Met à jour le volume en fonction de la distance
        this.el.sceneEl.addEventListener('tick', () => {
          if (marker.object3D.visible) {
            const markerPosition = marker.object3D.position;
            const cameraPosition = camera.object3D.position;

            // Calcule la distance entre la caméra et le marqueur
            const distance = markerPosition.distanceTo(cameraPosition);

            // Ajuste le volume selon la distance
            const maxDistance = 2; // Distance maximale pour volume 0
            const minDistance = 0.5; // Distance minimale pour volume 1
            let volume = 1 - (distance - minDistance) / (maxDistance - minDistance);
            volume = Math.max(0, Math.min(1, volume)); // Garde le volume entre 0 et 1

            // Applique le volume au son
            soundEntity.setAttribute('sound', 'volume', volume);
            console.log(`Distance: ${distance}, Volume: ${volume}`);
          }
        });
      }
    });

    // Ajoute le composant au marqueur
    document.querySelector('#marker').setAttribute('soundhandler', '');
}

export function sonAr() {
   
}