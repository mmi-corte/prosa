import { clearContainer, gameContainer } from "../../../app.js";
import { callAction } from "../../gameEventHandler.js";
import { gamesData } from "../../loadData.js";

let data = "";
let activeCleanup = null;

export function gameView(action) {
    // Clean any previous minigame
    if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
    }

    clearContainer();

    data = gamesData[action];

    console.log(data)

    // Load the game's HTML content
    fetch(`./games/${data.game}/index.html`)
        .then(response => response.text())
        .then(html => {
            // Parse HTML to extract body content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const gameContent = doc.body.innerHTML;

            // Create wrapper for the game
            const wrapper = document.createElement('div');
            wrapper.classList.add('minigame-wrapper');
            wrapper.innerHTML = gameContent;
            gameContainer.appendChild(wrapper);

            // Load CSS
            const styles = doc.querySelectorAll('link[rel="stylesheet"], style');
            styles.forEach(style => {
                if (style.tagName === 'LINK') {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = `./games/${data.game}/${style.getAttribute('href')}`;
                    document.head.appendChild(link);
                } else {
                    const styleEl = document.createElement('style');
                    styleEl.textContent = style.textContent;
                    document.head.appendChild(styleEl);
                }
            });

            // Load and execute scripts
            const scripts = doc.querySelectorAll('script[src]');
            let scriptsLoaded = 0;

            const loadScript = (src) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = `./games/${data.game}/${src}`;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            };

            // Load all scripts sequentially
            const loadScripts = async () => {
                for (const script of scripts) {
                    const src = script.getAttribute('src');
                    if (src) {
                        await loadScript(src);
                    }
                }

                // Set up message listener for game completion
                setupGameCompletion();
            };

            loadScripts();

            // Cleanup function
            activeCleanup = () => {
                // Remove added elements
                wrapper.remove();
                
                // Remove added styles
                const styleEl = document.querySelector(`link[href='games/${data.game}/style.css']`);
                if (styleEl) {
                    styleEl.remove();
                }

                // Remove added scripts
                const scriptEl = document.querySelector(`script[src='games/${data.game}/app.js']`);
                if (scriptEl) {
                    scriptEl.remove();
                }
            };
        })
        .catch(error => {
            console.error('Error loading minigame:', error);
            callAction(data.nextActionTypeWin, data.nextActionWin);
        });
}

function setupGameCompletion() {
    // Listen for custom event from minigame
    const handleGameComplete = (event) => {
        console.log('Received minigame-complete event:', event.detail);
        if (event.detail && event.detail.gameFinished) {
            if (activeCleanup) {
                activeCleanup();
                activeCleanup = null;
            }
            
            // Handle win or fail based on success property
            if (event.detail.success) {
                console.log('Calling win action');
                callAction(data.nextActionTypeWin, data.nextActionWin);
            } else {
                console.log('Calling lose action');
                console.log(data.nextActionLose, data.nextActionTypeLose)
                callAction(data.nextActionTypeLose, data.nextActionLose);
            }
            
            window.removeEventListener('minigame-complete', handleGameComplete);
        }
    };

    window.addEventListener('minigame-complete', handleGameComplete);
    console.log('Minigame completion listener set up');
}