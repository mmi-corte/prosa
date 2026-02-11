import { clearContainer, gameContainer } from "../../../app.js";
import { callAction } from "../../gameEventHandler.js";
import { decrementDifficultyState, isGameOver } from "../../initGame.js";
import { gamesData } from "../../loadData.js";
import { gameOverView } from "../main/gameOverView.js";
import { difficultyIncreaseModal } from "../components/difficultyIncreaseModal.js";
import { navigate } from "../../../router.js";

let data = "";

export function gameView(action) {
    clearContainer();
    data = gamesData[action];

    console.log(`🎮 Starting game: ${data.game}`);

    // Create iframe for isolated game execution
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100dvh';
    iframe.style.border = 'none';
    iframe.style.zIndex = '899';
    iframe.allow = 'camera; microphone';

    gameContainer.appendChild(iframe);

    // Hide header
    const header = document.querySelector('.header');
    if (header) {
        header.style.display = 'none';
    }

    // Load the game's HTML into the iframe
    fetch(`./games-playtests/${data.game}/index.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log(`✅ Loaded HTML for game: ${data.game} (index.html)`);

            // Parse to extract resources
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Get stylesheets
            const styleLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
                .map(link => {
                    let href = link.getAttribute('href');
                    if (!href.startsWith('http')) {
                        href = `./games-playtests/${data.game}/${href.split('/').pop()}`;
                    }
                    return `<link rel="stylesheet" href="${href}">`;
                })
                .join('');

            // Get inline styles
            const inlineStyles = Array.from(doc.querySelectorAll('style'))
                .map(style => `<style>${style.textContent}</style>`)
                .join('');

            // Get body content
            const bodyContent = doc.body.innerHTML;

            // Get scripts
            const scripts = Array.from(doc.querySelectorAll('script[src]'))
                .map(script => {
                    let src = script.getAttribute('src');
                    if (!src.startsWith('http')) {
                        src = `./games-playtests/${data.game}/${src.split('/').pop()}`;
                    }
                    return `<script src="${src}"><\/script>`;
                })
                .join('');

            // Build complete HTML
            const completeHTML = `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    ${styleLinks}
                    ${inlineStyles}
                    <style>
                        * { box-sizing: border-box; }
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            min-height: 100dvh;
                            overflow: auto;
                            -webkit-overflow-scrolling: touch;
                        }
                        body {
                            padding-top: env(safe-area-inset-top);
                            padding-right: env(safe-area-inset-right);
                            padding-bottom: env(safe-area-inset-bottom);
                            padding-left: env(safe-area-inset-left);
                        }
                    </style>
                </head>
                <body>
                    ${bodyContent}
                    <script>
                        // Communication with parent frame
                        window.finishGame = function(success) {
                            window.parent.postMessage(
                                { type: 'minigame-complete', success: success },
                                '*'
                            );
                        };
                    </script>
                    ${scripts}
                </body>
                </html>
            `;

            // Write to iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(completeHTML);
            iframeDoc.close();

            console.log(`✅ Game loaded in iframe`);
        })
        .catch(error => {
            console.error('Error loading minigame:', error);
            const header = document.querySelector('.header');
            if (header) header.style.display = '';

            // Debug message
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: #1a1a1a;
                color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                z-index: 900;
                font-family: monospace;
            `;
            debugDiv.innerHTML = `
                <h2>❌ Erreur chargement: ${data.game}</h2>
                <p>${error.message}</p>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="debugWinBtn" style="padding: 10px 16px;">CallAction Win</button>
                    <button id="debugLoseBtn" style="padding: 10px 16px;">CallAction Loose</button>
                </div>
            `;
            gameContainer.appendChild(debugDiv);

            const debugWinBtn = debugDiv.querySelector('#debugWinBtn');
            const debugLoseBtn = debugDiv.querySelector('#debugLoseBtn');

            debugWinBtn?.addEventListener('click', () => {
                callAction(data.nextActionTypeWin, data.nextActionWin);
            });

            debugLoseBtn?.addEventListener('click', () => {
                callAction(data.nextActionTypeLose, data.nextActionLose);
            });
        });

    // Listen for messages from iframe
    const handleMessage = (event) => {
        if (event.data && event.data.type === 'minigame-complete') {
            console.log(`🎮 Game finished:`, event.data);

            // Cleanup
            iframe.remove();
            const header = document.querySelector('.header');
            if (header) header.style.display = '';

            window.removeEventListener('message', handleMessage);

            // Handle result
            if (event.data.success) {
                console.log('✅ Game won - calling win action');
                callAction(data.nextActionTypeWin, data.nextActionWin);
            } else {
                console.log('❌ Game lost - checking difficulty');
                const hasLost = decrementDifficultyState();
                if (hasLost) {
                    difficultyIncreaseModal(() => {
                        navigate('gameover', gameOverView);
                    });
                } else {
                    difficultyIncreaseModal(() => {
                        callAction(data.nextActionTypeLose, data.nextActionLose);
                    });
                }
            }
        }
    };

    window.addEventListener('message', handleMessage);
}
