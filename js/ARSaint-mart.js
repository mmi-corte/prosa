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
  arjs="debugUIEnabled: false; smooth: true; smoothCount: 10; smoothTolerance: 0.01; smoothThreshold: 5;"
  renderer="antialias: true; logarithmicDepthBuffer: true; colorManagement: true; sortObjects: true;"
>
  <a-marker
    preset="pattern"
    type="pattern"
    url="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/ProsaQrCode1Test.patt?v=1734096265996"
  >
    <!-- Fond 1 (en premier plan) -->
    <a-image
      src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/fond1.png?v=1732542507271"
      position="0 0 0"
      rotation="-90 0 0"
      scale="5 5 5"
    ></a-image>

    <!-- Sorcière (devant) -->
    <a-image
      src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/sorciere.png?v=1732542517785"
      position="0 0 0"
      rotation="-90 0 0"
      scale="5 5 5"
    ></a-image>

    <!-- Fond 2 (derrière la sorcière) -->
    <a-image
      src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/fond2.png?v=1732542528465"
      position="0 0 0"
      rotation="-90 0 0"
      scale="5 5 5"
    ></a-image>

    <!-- Fond 3 (derrière le fond 2) -->
    <a-image
      src="https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/fond3.png?v=1732542512068"
      position="0 0 0"
      rotation="-90 0 0"
      scale="5 5 5"
    ></a-image>

    <!-- Boîte de dialogue -->
    <a-entity camera position="0 5 2" rotation="-90 0 0" scale="3 3 3">
      <!-- Réduction de la taille de l'ensemble -->
      <a-plane
        position="0 0 3.5"
        rotation="-90 0 0"
        scale="3 3 3"
        width="1.5"
        height="0.5"
        color="grey"
        material="opacity: 0.8; transparent: true"
      ></a-plane>
      <a-text
        value="Salut moi c'est la Strega"
        rotation="-90 0 0"
        scale="3 3 3"
        position="0 0 3.5"
        align="center"
        color="#000000"
        width="1.5"
        wrapCount="15"
        ><!-- Ajustez la largeur du texte pour l'adapter -->
      </a-text>
    </a-entity>
  </a-marker>

  <a-entity camera position="0 0 0"></a-entity>
</a-scene>

    `;
}

export function setupAudioControls() {
    // Workaround for an AR.js bug (https://github.com/jeromeetienne/AR.js/issues/410)
    const sceneEl = document.querySelector('a-scene');
    sceneEl.addEventListener('loaded', () => {
        newCamera = new THREE.PerspectiveCamera();
        newCamera.near = 0;
        newCamera.far = 5;
        sceneEl.camera = newCamera;
    });
}

export function sonAr() {
    //To avoid playing from start if the marker flickers, not sure if needed, but it might be a failsafe when you have mutiple markers and want to make sure the first finishes before launching the second
    var playing = false;

    //HTML5 audio, will need user touch input to start on mobile
    var intro = new Audio("https://cdn.glitch.global/b8947972-11bc-44cc-baba-0c13a7bcf225/G%C3%A9n%C3%A9rique%20Oui-oui%20fran%C3%A7ais%20(cover).mp3?v=1734099814492");

    //Detect end of audio
    intro.addEventListener("ended", function () {
        intro.currentTime = 0;
        playing = false;
    });

    AFRAME.registerComponent('markerFound', {

        init: function () {
            intro.play();
            // Set up the tick throttling. Will check if marker is active every 500ms
            this.tick = AFRAME.utils.throttleTick(this.tick, 500, this);
        },
        tick: function (t, dt) {

            if (playing == false) {
                // MARKER IS PRESENT
                intro.play();
                playing = true;
            } else {
                // MARKER IS HIDDEN, do nothing (up to you)
            }

        }
    });
}