let typingTimeout = ""
export let isTyping = ""
const defaultDelay = 30

export function typeWriteEffect(container, text, pitch = 400) {
    return new Promise((resolve) => {
        container.innerHTML = "";
        isTyping = true;
        let i = 0;

        function type() {
            if (i < text.length) {
                const char = text.charAt(i);
                container.innerHTML += char;
                // Look ahead at the next character
                const nextChar = text.charAt(i + 1);

                let currentDelay = defaultDelay;

                if (char !== " ") {
                    playLetterSound(pitch);
                }

                const isEndPunctuation = char === "." || char === "!" || char === "?";
                const isMidPunctuation = char === "," || char === ":" || char === ";";
                // 2. Check if the *next* character is a closing quote
                const isQuote = nextChar === '"' || nextChar === '”';

                if (isEndPunctuation) {
                    // If the NEXT char is a quote, rush this punctuation (fast delay)
                    // Otherwise, do the normal long pause
                    if (isQuote) {
                        currentDelay = defaultDelay;
                    } else {
                        currentDelay = 500;
                    }
                }
                else if (isMidPunctuation) {
                    if (isQuote) {
                        currentDelay = defaultDelay;
                    } else {
                        currentDelay = 300;
                    }
                } else if (char === "…") {
                    if (isQuote) {
                        currentDelay = defaultDelay;
                    } else {
                        currentDelay = 700;
                    }
                }

                i++;

                // Store the ID so we can clear it on click
                typingTimeout = setTimeout(type, currentDelay);
            } else {
                isTyping = false;
                resolve()
            }
        }

        type();
    })
}

export function skipTypeWrite() {
    clearTimeout(typingTimeout);
    isTyping = false;
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Define the "Shape" of our wave once (globally), so we don't rebuild it every click
// This specific array mix creates a sine wave with a little bit of "brightness"
const real = new Float32Array([0, 0, 0, 0, 0]);
const imag = new Float32Array([0, 1, 0, 0, 0.1]);
const customWave = audioCtx.createPeriodicWave(real, imag);

function playLetterSound(pitch) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // INSTEAD of 'sine' or 'triangle', we use our custom wave
    oscillator.setPeriodicWave(customWave);

    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    // You can likely keep the volume lower now, as the extra harmonics add perceived loudness
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}