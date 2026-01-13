import { callAction, dialogsData } from "./main.js";

export function dialogsHandler(dialogId) {
    //Récupération du dialogue avec l'ID donné
    const dialog = dialogsData.find(item => item.id === dialogId)
    console.log("Found dialog:", dialog)

    //...Affichage du dialogue

    //Fin de l'action
    const { nextActionType, nextAction } = dialog;
    callAction(nextActionType, nextAction)
}