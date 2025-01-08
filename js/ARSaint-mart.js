//import { loadSound, } from './Sound/sound.js';
//---------------STREGA------------------------------------
export function addStrega(containerId) {
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
  setupAudioControls();
}
//---------------ESTERELLE------------------------------------
export function addEsterelle(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Le conteneur avec l'ID ${containerId} n'existe pas.`);
    return;
  }

  // Crée la structure HTML de la scène AR
  container.innerHTML = `
      <a-scene
      embedded
      arjs="debugUIEnabled: false; smooth: true; smoothCount: 10; smoothTolerance: 0.01; smoothThreshold: 5;"
      renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; sortObjects: true;"
    >
      <a-assets>
        <audio
          id="sound"
          src="https://cdn.glitch.global/d38faf7e-01c3-44e6-9906-e36768c14259/son-principal.mp3?v=1734604228090"
          preload="auto"
        ></audio>
      </a-assets>

      <a-marker
        id="marker"
        preset="pattern"
        type="pattern"
        url="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/ProsaQrCode1Test.patt?v=1734096265996"
      >
        <!-- premier plan  (en avant) -->
        <a-image
          src="https://cdn.glitch.global/d38faf7e-01c3-44e6-9906-e36768c14259/f%C3%A9e%20des%20plantes%20textur%C3%A9e%20V1.png?v=1734346180920"
          position="0 -0.5 0"
          rotation="-90 0 0"
          scale="10 10 10"
          material="transparent: true; alphaTest: 0.5;"
        >
        </a-image>

        <!-- Boîte de dialogue -->
        <a-plane
          position="0 0 8"
          rotation="-90 0 0"
          scale="8 8 8"
          width="1.5"
          height="0.5"
          color="grey"
          material="opacity: 0.8; transparent: true"
        >
        </a-plane>
        <a-text
          value="Salut moi c'est Esterelle"
          rotation="-90 0 0"
          scale="8 8 8"
          position="0 0 8"
          align="center"
          color="#000000"
          width="1.5"
          wrapCount="15"
        >
        </a-text>
      </a-marker>

      <a-entity
        sound="src: #sound; autoplay: false; loop: true;"
        id="audioEntity"
      ></a-entity>
      <a-entity camera position="0 0 0"></a-entity>
    </a-scene>

  `;
  setupAudioControls();
}

export function ARAfata(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Le conteneur avec l'ID ${containerId} n'existe pas.`);
    return;
  }

  // Crée la structure HTML de la scène AR
  container.innerHTML = `
       <a-scene
      embedded
      arjs="debugUIEnabled: false; smooth: true; smoothCount: 10; smoothTolerance: 0.01; smoothThreshold: 5;"
      renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; sortObjects: true;"
    >
      <a-assets>
        <audio
          id="sound"
          src="https://cdn.glitch.global/6edc1d7c-0499-4753-9956-9dfec8252444/son-principal.mp3?v=1734604153963"
          preload="auto"
        ></audio>
      </a-assets>

      <a-marker
        id="marker"
        preset="pattern"
        type="pattern"
        url="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/ProsaQrCode1Test.patt?v=1734096265996"
      >
        <!-- premier plan  (en avant) -->
        <a-image
          src="https://cdn.glitch.global/6edc1d7c-0499-4753-9956-9dfec8252444/f%C3%A9e%20de%20l'eau%20textur%C3%A9e%20v1%20premier%20plan.png?v=1734345000981"
          position="0 -0.5 0"
          rotation="-90 0 0"
          scale="5 5 5"
          material="transparent: true; alphaTest: 0.5;"
        >
        </a-image>

        <a-image
          src="https://cdn.glitch.global/6edc1d7c-0499-4753-9956-9dfec8252444/f%C3%A9e%20de%20l'eau%20textur%C3%A9e%20v1%20background.png?v=1734344997628"
          position="0 -1 0"
          rotation="-90 0 0"
          scale="5 5 5"
          material="transparent: true; alphaTest: 0.5;"
        >
        </a-image>
        
        <!-- Boîte de dialogue -->
        <a-plane
          position="0 0 4"
          rotation="-90 0 0"
          scale="3 3 3"
          width="2"
          height="1"
          color="grey"
          material="opacity: 0.8; transparent: true"
        >
        </a-plane>
        <a-text
          value="Après un long périple en bâteau, vous voilà enfin sur l’île de Prose. A vrai dire, vous ne saviez même pas si elle existait véritablement, alors c’est un soulagement d’y être enfin arrivé. La chose que vous n’aviez pas prévu, en revanche, c’était que le bâteau, c’est épuisant, surtout quand on doit pagayer soi-même. A à peine quelques mètres sur la plage, vous vous evanouissez, à bout de force après ce long trajet."
          rotation="-90 0 0"
          scale="3 3 3"
          position="0 0 4"
          align="center"
          color="#000000"
          width="1.5"
          wrapCount="15"
        >
        </a-text>
      </a-marker>

      <a-entity
        sound="src: #sound; autoplay: false; loop: true;"
        id="audioEntity"
      ></a-entity>
      <a-entity camera position="0 0 0"></a-entity>
    </a-scene>

  `;
  const marker = document.querySelector("#marker");
const camera = document.querySelector("[camera]");
const audioEntity = document.querySelector("#audioEntity");

// Vérifiez et ajustez l'audio toutes les 100 ms
setInterval(() => {
  setupAudioControls(marker, camera, audioEntity);
}, 100);


  supprBtnVR();
}

function supprBtnVR() {
  const scene = document.querySelector('a-scene');

  if (scene) {
    scene.addEventListener('enter-vr', () => {
      const vrButton = document.querySelector('.a-enter-vr-button');
      if (vrButton) {
        vrButton.style.display = 'none'; // Masquer le bouton VR
      }
    });
  }
}
//--------------------SON------------------------------------
function setupAudioControls(marker, camera, audioEntity, maxDistance = 5) {
  // Vérifiez si le marqueur est visible
  if (!marker.object3D.visible) {
    // Si le marqueur n'est pas visible, arrêter le son
    const soundComponent = audioEntity.components.sound;
    if (soundComponent && soundComponent.isPlaying) {
      soundComponent.stopSound();
    }
    return; // Ne rien faire d'autre
  }

  // Récupérer les positions du marqueur et de la caméra
  const markerPosition = marker.object3D.position;
  const cameraPosition = camera.object3D.position;

  // Calcul de la distance
  const dx = markerPosition.x - cameraPosition.x;
  const dy = markerPosition.y - cameraPosition.y;
  const dz = markerPosition.z - cameraPosition.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Ajustement du volume
  const minVolume = 0.1; // Volume minimum
  const volume = Math.max(minVolume, 1 - distance / maxDistance);

  // Vérifiez si le composant son existe
  const soundComponent = audioEntity.components.sound;
  if (soundComponent) {
    // Ajustez le volume
    audioEntity.setAttribute("sound", "volume", volume);

    // Jouez ou arrêtez le son en fonction de la distance
    if (!soundComponent.isPlaying) {
      soundComponent.playSound();
    }
  }
}
