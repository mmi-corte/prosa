import { DEBUG } from "../main.js";

export function log(msg, color="black", font_weight="bold") {
    if(DEBUG){
        console.log(`%c${msg}`,`color: ${color}; font-weight: ${font_weight};`);
    }
}