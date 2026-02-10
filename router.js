// ====================================
// ============= VIEW ROUTER ==========

import { aleasView } from "./js/views/main/aleasView.js"
import { charactersView } from "./js/views/main/charactersView.js"
import { codeView } from "./js/views/main/codeView.js"
import { gameOverView } from "./js/views/main/gameOverView.js"
import { characterSelectView } from "./js/views/main/initViews/characterSelectView.js"
import { difficultyView } from "./js/views/main/initViews/difficultyView.js"
import { playerCountView } from "./js/views/main/initViews/playerCountView.js"
import { playerSubmitView } from "./js/views/main/initViews/playerSubmitView.js"
import { menuView } from "./js/views/main/menuView.js"
import { playerSelectView } from "./js/views/main/playerSelectView.js"
import { progressionView } from "./js/views/main/progressionView.js"
import { qrView } from "./js/views/main/qrView.js"
import { seasonsView } from "./js/views/main/seasonsView.js"
import { settingView } from "./js/views/main/settingView.js"

// ====================================
const viewRoutes = {
    'menu': menuView,
    'jeu/code': codeView,
    'jeu/choix-joueur': playerSelectView,
    'resume': progressionView,
    'qr': qrView,
    'parametres': settingView,
    'gameover': gameOverView,
    'aleas': aleasView,
    'aleas/enigme': aleasView,
    'nouvelle-partie/choix-difficulte': difficultyView,
    'nouvelle-partie/nombre-joueur': playerCountView,
    'nouvelle-partie/choix-personnage': characterSelectView,
    'nouvelle-partie/confirmation': characterSelectView,
    'univers-prosa/encyclopedie': charactersView,
    'univers-prosa/saisons': seasonsView
}

// ====================================
// ============= NAVIGATE =============
// ====================================
export function navigate(viewName, viewFunction, updateUrl = true) {
    // Store the state with the view name
    const state = { view: viewName }
    let url = ""
    if (updateUrl) {
        url = `#${viewName}`
    }

    try {
        history.pushState(state, "", url)
    } catch (e) {
        console.warn('Could not update history:', e);
    }

    // Always call the view function when navigating
    if (typeof viewFunction === 'function') {
        viewFunction()
    }
}

function callView(viewName) {
    const viewFunction = viewRoutes[viewName]
    if (!viewFunction) {
        try {
            history.replaceState({ view: 'menu' }, "", "#menu")
        } catch (e) {
            console.warn('Could not replace history state:', e)
        }
        menuView?.()
        return
    }
    viewFunction?.()
}

// ====================================
// ============= POPSTATE =============
// ====================================
window.addEventListener('popstate', (event) => {
    const viewName = event.state ? event.state.view : 'menu'
    callView(viewName)
})