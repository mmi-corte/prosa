
import { setCookie } from './cookieHandler.js';
import {popup} from './popup.js';

export function loadLvl2() {


    // Lance les étapes
    playSteps(steps);

    // update screen cookie
    setCookie("level", "2", 7, "/");
}
