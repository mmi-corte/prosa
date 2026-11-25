import { clearContainer, gameContainer } from "../../../app.js";
import { navigate } from "../../../router.js";
import { gameInitialized, setDifficulty } from "../../initGame.js";
import { difficultyView } from "./initViews/difficultyView.js";
import { menuView } from "./menuView.js";

export let wrapper;
export let initTextContainer;
export let initContainer;
export let initPlayerCount = 2
export let initSequence = false
export let initDifficulty
export let selectedPlayers = []

export function initView() {
    //If game already initialized, ignore init sequence
    if (gameInitialized) {
        navigate("menu", menuView)
        return
    }

    //For history management, if an init view is called but not finished,
    //check this to redirect to menu instead of the init view
    initSequence = true

    if (initSequence) {
        console.log("Init sequence started")
    }

    clearContainer();

    const startInitFlow = () => {
        wrapper = document.createElement('div');
        wrapper.classList.add('initWrapper');
        gameContainer.append(wrapper);

        initTextContainer = document.createElement('p');
        wrapper.appendChild(initTextContainer);

        initContainer = document.createElement('div');
        initContainer.classList.add('initScreen1');
        wrapper.appendChild(initContainer)

        // Load difficulty screen first
        navigate('nouvelle-partie/choix-difficulte', difficultyView)
    }

    if (localStorage.getItem('introCinematicWatched') === 'true') {
        startInitFlow()
    } else {
        playIntroCinematic(() => {
            localStorage.setItem('introCinematicWatched', 'true')
            startInitFlow()
        })
    }
}

function playIntroCinematic(onComplete) {
    const overlay = document.createElement('div')
    overlay.className = 'intro-cinematic-overlay'
    overlay.innerHTML = `
        <video class="intro-cinematic-video" autoplay playsinline preload="auto">
            <source src="./assets/cinematiques/cinematique1.mp4" type="video/mp4">
        </video>
        <button class="intro-cinematic-skip" type="button">Passer ▶</button>
    `
    document.body.appendChild(overlay)

    const video = overlay.querySelector('video')
    const skipBtn = overlay.querySelector('.intro-cinematic-skip')

    let finished = false
    let hardStopTimer
    const finish = () => {
        if (finished) return
        finished = true
        clearTimeout(hardStopTimer)
        try { video.pause() } catch (_) {}
        overlay.classList.add('fade-out')
        setTimeout(() => {
            overlay.remove()
            if (typeof onComplete === 'function') onComplete()
        }, 300)
    }

    // Stalled/blocked video must never leave a full-screen click blocker behind.
    hardStopTimer = setTimeout(finish, 15000)

    video.addEventListener('ended', finish)
    video.addEventListener('error', finish)
    skipBtn.addEventListener('click', finish)

    // Best-effort autoplay; fallback to user gesture
    video.play().catch(() => {
        const resume = () => {
            video.play().catch(() => {})
            overlay.removeEventListener('click', resume)
        }
        overlay.addEventListener('click', resume, { once: true })
    })
}

/**
 * Init views append their controls to cached nodes. clearContainer() detaches
 * those nodes on every navigation (including Back/Forward), so rebuild them
 * when an init route is entered directly.
 */
export function ensureInitContainer() {
    if (!wrapper?.isConnected || !initTextContainer?.isConnected || !initContainer?.isConnected) {
        wrapper = document.createElement('div')
        wrapper.classList.add('initWrapper')
        gameContainer.appendChild(wrapper)

        initTextContainer = document.createElement('p')
        wrapper.appendChild(initTextContainer)

        initContainer = document.createElement('div')
        initContainer.classList.add('initScreen1')
        wrapper.appendChild(initContainer)
    }
    return initContainer
}

export function clearInitContainer() {
    ensureInitContainer()
    if (initContainer) {
        initContainer.classList.remove(...initContainer.classList)
        initTextContainer.innerHTML = null
        initContainer.innerHTML = null;
    }
}

export function setInitDifficulty(difficulty) {
    initDifficulty = difficulty
    console.log("Difficulty set to", difficulty)
    setDifficulty(difficulty)
}

export function setInitPlayerCount(count) {
    initPlayerCount = count
    console.log("Player count set to", count)
}

export function setInitPlayers(playerData = null, reset = false) {

    if (reset) {
        selectedPlayers = []
        return
    }

    if (initPlayerCount >= 2 && initPlayerCount <= 6) {
        for (let i = 0; i < initPlayerCount; i++) {
            selectedPlayers[i] = {
                character: 0,
                localisation: 0,
                unlockedSteps: {},
                language: 'fr'
            };
        }
        console.log(`${initPlayerCount} players initialized.`);
    } else {
        console.error("Critical: Invalid player count");
        playerCountView() //Reset the player count screen
    }
}