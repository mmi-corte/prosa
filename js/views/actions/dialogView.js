import { clearContainer, gameContainer } from "../../../app.js";

export function dialogView(action) {
    clearContainer()

    const wrapper = document.createElement('div')
    wrapper.classList.add('dialogWrapper')

    gameContainer.appendChild(wrapper)

    const textBox = document.createElement('p')
    textBox.innerText = ""
    gameContainer.appendChild(textBox)

    //SAMPLE DATA
    //Devra etre remplacé par les fetch des data
    const data = {
        dialog: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }

    textBox.innerText = data.dialog

    textBox.addEventListener('click', () => {

    })
}