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

    // If no minigame is defined yet, skip directly to win action
    if (!data.game) {
        console.warn('No minigame defined for this step, auto-advancing.');
        callAction(data.nextActionTypeWin, data.nextActionWin);
        return;
    }

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

    // Hide header
    const header = document.querySelector('.header');
    if (header) {
        header.style.display = 'none';
    }

    // Load game via src so location.reload() works inside minigames
    iframe.src = `./games-playtests/${data.game}/index.html`;

    iframe.onload = () => {
        try {
            // Inject finishGame helper for games that use it
            const script = iframe.contentDocument.createElement('script');
            script.textContent = `
                if (typeof window.finishGame === 'undefined') {
                    window.finishGame = function(success) {
                        window.parent.postMessage(
                            { type: 'minigame-complete', success: success },
                            '*'
                        );
                    };
                }
            `;
            iframe.contentDocument.head.appendChild(script);
            console.log(`✅ Game loaded in iframe: ${data.game}`);
        } catch (e) {
            console.warn('Could not inject finishGame helper:', e);
        }
    };

    iframe.onerror = () => {
        console.error('Error loading minigame:', data.game);
        if (header) header.style.display = '';
    };

    gameContainer.appendChild(iframe);

    // Listen for messages from iframe
    const handleMessage = (event) => {
        const validTypes = ['minigame-complete', 'GAME_COMPLETE', 'game_complete'];
        if (event.data && validTypes.includes(event.data.type)) {
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
