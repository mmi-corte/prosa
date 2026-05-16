import { settings } from '../app.js';

const TRACKS = [
    './assets/music/La_Ruina_v2_Final.mp3',
    './assets/music/L_espoir_de_prosa_3.mp3',
    './assets/music/Inquietude.mp3',
    './assets/music/Foret_magique.mp3',
];

// Background music sits at 18% of the user's music volume setting
const MUSIC_VOLUME_RATIO = 0.18;

let audio = null;
let currentTrackIndex = -1;
let muted = false;

export function startMusic() {
    if (audio && !audio.paused) return;

    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * TRACKS.length);
    } while (TRACKS.length > 1 && nextIndex === currentTrackIndex);
    currentTrackIndex = nextIndex;

    if (audio) {
        audio.pause();
        audio.src = '';
    }

    audio = new Audio(TRACKS[currentTrackIndex]);
    audio.loop = true;
    audio.volume = muted ? 0 : (settings.music / 100) * MUSIC_VOLUME_RATIO;
    audio.play().catch(() => {});
}

export function stopMusic() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio = null;
}

export function updateMusicVolume() {
    if (!audio) return;
    audio.volume = muted ? 0 : (settings.music / 100) * MUSIC_VOLUME_RATIO;
}

export function toggleMusicMute() {
    muted = !muted;
    updateMusicVolume();
    return muted;
}

export function isMusicMuted() {
    return muted;
}
