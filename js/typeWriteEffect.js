let typingTimeout = ""
export let isTyping = ""

export function typeWriteEffect(contaner, text, pitch = 400) {
    return new Promise((resolve) => {
        contaner.innerHTML = "";
        isTyping = true;
        let i = 0;

        function type() {
            if (i < text.length) {
                const char = text.charAt(i);
                contaner.innerHTML += char;

                let currentDelay = 30;

                if (char !== " ") {
                    playLetterSound(pitch);
                }

                if (char === "." || char === "!" || char === "?") {
                    currentDelay = 500;
                } else if (char === "," || char === ":" || char === ";") {
                    currentDelay = 200;
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

// Audio logic remains the same...
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playLetterSound(pitch) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}