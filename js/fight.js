import { addOverlay } from "./overslay.js";
import { loadSound, suspendSound } from './Sound/sound.js';
import { ajouterBouton } from './button.js';
import { playerUserName } from "../main.js";

export async function lunchFight(skin, weapons, enemies)
{
    return new Promise((resolve) => {

    //player hp
    const playerHp = 100;
    var pHp= playerHp;

    //enemy hp var
    var hp = enemies.hp;

    const fightContainer = document.createElement("div");
    const container = document.getElementById("container");
    container.appendChild(fightContainer);
    fightContainer.id = "fightContainer";
    fightContainer.className = "fightContainer";

    // Create Bg Image
    const bgImage = document.createElement("img");
    bgImage.src = `assets/bg/bg.png`; 
    bgImage.className = "bgImage";
    fightContainer.appendChild(bgImage);

    const enemyBloc = document.createElement("div");
    enemyBloc.className = "fightBloc";
    fightContainer.appendChild(enemyBloc);

    const enemyName = document.createElement("p");
    enemyName.className = "txtName";
    enemyBloc.appendChild(enemyName);
    enemyName.innerHTML = enemies.name;

    // Create a life gauge counter
    const lifeEnemyCounter = document.createElement("p");
    lifeEnemyCounter.className = "txt";
    lifeEnemyCounter.id = "lifeCounter1";
    lifeEnemyCounter.innerHTML = hp + "/"+ enemies.hp;
    enemyBloc.appendChild(lifeEnemyCounter);

    // Create a life gauge container
    const lifeGaugeContainer = document.createElement("div");
    lifeGaugeContainer.className = "lifeGaugeContainer";
    enemyBloc.appendChild(lifeGaugeContainer);

    // Create a life gauge bar
    const lifeGauge = document.createElement("div");
    lifeGauge.className = "lifeGauge";
    lifeGaugeContainer.appendChild(lifeGauge);

    // Set initial life gauge width based on enemy's life
    lifeGauge.style.width = `100%`;

    // Function to update the life gauge
    function updateLifeEnemyGauge(damage) {
        hp -= damage;
        lifeEnemyCounter.innerHTML = hp + "/"+ enemies.hp;
        var gaugpourcentage = (100*hp/enemies.hp);
        lifeGauge.style.width = `${gaugpourcentage}%`;
    }

    // Example usage: update life gauge to 50%
    // updateLifeEnemyGauge(70);

    // Create Enemy Image

    const enemyContainer = document.createElement("div");
    enemyContainer.className = "enemyContainer";
    fightContainer.appendChild(enemyContainer);

    const enemyImage = document.createElement("img");
    enemyImage.src = `assets/enemies/${enemies.name}.png`; // Set the source of the image
    enemyImage.className = "enemyImage"; // Add a class for styling
    // Append the image to the enemy container
    enemyContainer.appendChild(enemyImage);

    // Create Player Image

    const playerContainer = document.createElement("div");
    playerContainer.className = "playerContainer";
    fightContainer.appendChild(playerContainer);

    const playerImage = document.createElement("img");
    playerImage.src = `assets/avatar/${skin}.png`; // Set the source of the image
    // playerImage.style = 'filter: blur(2px);'
    playerImage.className = "playerImage"; // Add a class for styling
    // Append the image to the enemy container
    playerContainer.appendChild(playerImage);

    //Create Weapons Bloc

    const weaponsBloc = document.createElement("div");
    weaponsBloc.className = "weaponsBloc y-area";
    fightContainer.appendChild(weaponsBloc);

    weapons.forEach(element => {
        const weapons = document.createElement("div");
        weapons.className = "weapons";
        weaponsBloc.appendChild(weapons);
        const weaponName = document.createElement("p");
        weaponName.className = "txtTitle";
        weaponName.innerHTML = element.name;
        weapons.appendChild(weaponName);
        //color button
        if(element.name == "Epée")
        {
            weapons.style = "background-color: #E8E6CA";
        }
        else if(element.name == "Grimoire")
        {
            weapons.style = "background-color: #EDCE8E";
        }
        else
        {
            weapons.style = "background-color: #CF881B";
        }
    });

    //Create PLayer Life Gauge

    const playerLifeContainer = document.createElement("div");
    playerLifeContainer.className = "playerLifeContainer";
    fightContainer.appendChild(playerLifeContainer);
    // Create image of journal icon
    const journalIcon = document.createElement("img");
    journalIcon.src = `assets/icons/journal.png`;
    journalIcon.className = "journalIcon";
    playerLifeContainer.appendChild(journalIcon);

    //IMPORTANT

    //life Gauge Container again
    const pContainer = document.createElement("div");
    playerLifeContainer.appendChild(pContainer);
    pContainer.className = "pContainer";

    // Player Name

    const playerName = document.createElement("p");
    playerName.className = "txtTitle";
    playerName.innerHTML = playerUserName;
    pContainer.appendChild(playerName);

    // Create a life gauge counter
    const lifePlayerCounter = document.createElement("p");
    lifePlayerCounter.className = "txt";
    lifePlayerCounter.id = "lifeCounter2";
    lifePlayerCounter.innerHTML =pHp + "/"+ playerHp;
    pContainer.appendChild(lifePlayerCounter);

    // const br = document.createElement("br");
    // pContainer.appendChild(br);

    // Create a life gauge container
    const playerLifeGaugeContainer = document.createElement("div");
    playerLifeGaugeContainer.className = "playerLifeGaugeContainer";
    pContainer.appendChild(playerLifeGaugeContainer);

    // Create a life gauge bar
    const playerLifeGauge = document.createElement("div");
    playerLifeGauge.className = "lifeGauge";
    playerLifeGaugeContainer.appendChild(playerLifeGauge);

    // Set initial life gauge width based on enemy's life
    playerLifeGauge.style.width = `100%`;

    // Function to update the life gauge
    function updateLifeGauge(damage) {
        pHp -= damage;
        lifePlayerCounter.innerHTML = pHp + "/"+ playerHp;
        var gaugpourcentage = (100*pHp/playerHp);
        playerLifeGauge.style.width = `${gaugpourcentage}%`;
    }

    // Example usage: update life gauge to 50%
    // updateLifeGauge(80);

    // Create a blocker/ overlay
        const blocker = document.createElement("div");
        blocker.className = "blocker";
        fightContainer.appendChild(blocker);

        function disableInteractions() {
            const blocker = document.getElementsByClassName('blocker')[0];
            blocker.style.pointerEvents = 'all'; // Active le blocage des clics
            blocker.style.display = 'block';
        }
        
        function enableInteractions() {
            const blocker = document.getElementsByClassName('blocker')[0];
            blocker.style.pointerEvents = 'none'; // Désactive le blocage
            blocker.style.display = 'none';
        }
        
        addOverlay("C'est ton tour !");

        const OverlayText = document.createElement("p");

        function createnewOverlay(text)
        {
            const overlay = document.getElementsByClassName('overlay')[0];

            function fadeIn(element) {
                element.classList.remove("fade-out");
                element.classList.add("fade-in");
                element.style.display = "flex"; // Rendre visible si nécessaire
            }
            
            function fadeOut(element) {
                element.classList.remove("fade-in");
                element.classList.add("fade-out");
                setTimeout(() => {
                element.style.display = "none"; // Cache l'élément après l'animation
                }, 2000); // La durée doit correspondre à celle de l'animation CSS
            }
    
            fadeIn(overlay);
            
            setTimeout(() => {
                fadeOut(overlay);
            }, 3000);
    
            
            OverlayText.className = "OverlayTxt";
            OverlayText.innerHTML = text;
            overlay.appendChild(OverlayText);
        }

        function createnewEndingOverlay(text)
        {
            const overlay = document.getElementsByClassName('overlay')[0];

    
                overlay.classList.remove("fade-out");
                overlay.classList.add("fade-in");
                overlay.style.display = "flex"; // Rendre visible si nécessaire
            
    
            
            OverlayText.className = "OverlayTxt";
            OverlayText.innerHTML = text;
            overlay.appendChild(OverlayText);
        }
    
        function damageVibration(subject)
        {
            const subj = document.getElementsByClassName(subject)[0];
            
            subj.classList.add("vibration");
            setTimeout(() => {
                subj.classList.remove("vibration");
            }, 500);
            
            
        }

    fighting();

    createnewOverlay("C'est ton tour !");

    function fighting()
    {
        
        enableInteractions();

        weapons.forEach((element, key) => {
            const weapon = document.getElementsByClassName("weapons")[key];
            const newWeapon = weapon.cloneNode(true);
            weapon.parentNode.replaceChild(newWeapon, weapon);
        });

        weapons.forEach((element, key) => {
            
            const weapon = document.getElementsByClassName("weapons")[key];
            const hit =()=>{
                //sound
                if(element.name == "Epée")
                {
                    loadSound("assets/sound/sword.mp3");

                    const lottiePlayer = document.createElement('lottie-player');
                

                
                    lottiePlayer.setAttribute('src', 'assets/animation/BladeStrike.json');
                    
                    lottiePlayer.setAttribute('background', 'transparent');
                    lottiePlayer.setAttribute('speed', '1');
                    lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                    lottiePlayer.setAttribute('loop', 'none');
                    lottiePlayer.setAttribute('controls', '');
                    lottiePlayer.setAttribute('autoplay', '');
                    lottiePlayer.setAttribute('direction', '1');
                    lottiePlayer.setAttribute('mode', 'normal');

                    // Ajoute le player dans le conteneur
                    enemyContainer.appendChild(lottiePlayer);
                    
                    setTimeout(() => {
                        lottiePlayer.remove();
                    }, 1200);
                }
                else if(element.name == "Grimoire")
                {
                    const lottiePlayer = document.createElement('lottie-player');

                    lottiePlayer.setAttribute('src', 'assets/animation/Magic.json');
                    
                    lottiePlayer.setAttribute('background', 'transparent');
                    lottiePlayer.setAttribute('speed', '1');
                    lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                    lottiePlayer.setAttribute('loop', 'none');
                    lottiePlayer.setAttribute('controls', '');
                    lottiePlayer.setAttribute('autoplay', '');
                    lottiePlayer.setAttribute('direction', '1');
                    lottiePlayer.setAttribute('mode', 'normal');

                    // Ajoute le player dans le conteneur
                    enemyContainer.appendChild(lottiePlayer);
                    
                    setTimeout(() => {
                        lottiePlayer.remove();
                    }, 1200);
                    loadSound("assets/sound/Book.mp3");
                }
                else
                {
                    if (enemies.name === "Basgialiscu")
                        {
                            
                            // while (weaponsBloc.firstChild) {
                            //     weaponsBloc.removeChild(weaponsBloc.firstChild);
                            // }
                            createnewOverlay("Tu as 3s pour viser !");

                            weaponsBloc.classList.remove("y-area");
                            weaponsBloc.classList.add("y-area2");
                            
                            weaponsBloc.innerHTML = `
                            <div class="weaponsBloc">
                                <div class="weapons" style="background-color: rgb(207, 136, 27);">
                                    <p class="txtTitle">Tête</p>
                                </div>
                                <div class="weapons" style="background-color: rgb(207, 136, 27);">
                                    <p class="txtTitle">Cou</p>
                                </div>
                                <div class="weapons" style="background-color: rgb(207, 136, 27);">
                                    <p class="txtTitle">Corp</p>
                                </div> 
                                <div class="weapons" style="background-color: rgb(207, 136, 27);">
                                    <p class="txtTitle">Pattes</p>
                                </div> 
                            </div>`;

                            const head = document.querySelector("#fightContainer > div.weaponsBloc > div > div:nth-child(1)");
                            const neck = document.querySelector("#fightContainer > div.weaponsBloc > div > div:nth-child(2)");
                            const body = document.querySelector("#fightContainer > div.weaponsBloc > div > div:nth-child(3)");
                            const foot = document.querySelector("#fightContainer > div.weaponsBloc > div > div:nth-child(4)");

                            const headhit = () => {
                                const lottiePlayer = document.createElement('lottie-player');

                                lottiePlayer.setAttribute('src', 'assets/animation/Cross.json');
                                
                                lottiePlayer.setAttribute('background', 'transparent');
                                lottiePlayer.setAttribute('speed', '1');
                                lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                                lottiePlayer.setAttribute('loop', 'none');
                                lottiePlayer.setAttribute('autoplay', '');
                                lottiePlayer.setAttribute('direction', '1');
                                lottiePlayer.setAttribute('mode', 'normal');

                                // Ajoute le player dans le conteneur
                                enemyContainer.appendChild(lottiePlayer);
                                
                                setTimeout(() => {
                                    lottiePlayer.remove();
                                }, 1200);
                                loadSound("assets/sound/bow.mp3");
                                damageVibration("enemyContainer");
                                updateLifeEnemyGauge(2);
                                head.removeEventListener("click", headhit);
                            }

                            head.addEventListener("click", headhit);

                            const neckhit = () => {
                                const lottiePlayer = document.createElement('lottie-player');

                                lottiePlayer.setAttribute('src', 'assets/animation/Cross.json');
                                
                                lottiePlayer.setAttribute('background', 'transparent');
                                lottiePlayer.setAttribute('speed', '1');
                                lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                                lottiePlayer.setAttribute('loop', 'none');
                                lottiePlayer.setAttribute('autoplay', '');
                                lottiePlayer.setAttribute('direction', '1');
                                lottiePlayer.setAttribute('mode', 'normal');

                                // Ajoute le player dans le conteneur
                                enemyContainer.appendChild(lottiePlayer);
                                
                                setTimeout(() => {
                                    lottiePlayer.remove();
                                }, 1200);
                                loadSound("assets/sound/bow.mp3");
                                damageVibration("enemyContainer");
                                updateLifeEnemyGauge(80);
                                neck.removeEventListener("click", neckhit);
                            }

                            neck.addEventListener("click", neckhit);


                            const bodyhit = () => {
                                const lottiePlayer = document.createElement('lottie-player');

                                lottiePlayer.setAttribute('src', 'assets/animation/Cross.json');
                                
                                lottiePlayer.setAttribute('background', 'transparent');
                                lottiePlayer.setAttribute('speed', '1');
                                lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                                lottiePlayer.setAttribute('loop', 'none');
                                lottiePlayer.setAttribute('autoplay', '');
                                lottiePlayer.setAttribute('direction', '1');
                                lottiePlayer.setAttribute('mode', 'normal');

                                // Ajoute le player dans le conteneur
                                enemyContainer.appendChild(lottiePlayer);
                                
                                setTimeout(() => {
                                    lottiePlayer.remove();
                                }, 1200);
                                loadSound("assets/sound/bow.mp3");
                                damageVibration("enemyContainer");
                                updateLifeEnemyGauge(2);
                                body.removeEventListener("click", bodyhit);
                            }

                            body.addEventListener("click", bodyhit);

                            const foothit = () => {
                                const lottiePlayer = document.createElement('lottie-player');

                                lottiePlayer.setAttribute('src', 'assets/animation/Cross.json');
                                
                                lottiePlayer.setAttribute('background', 'transparent');
                                lottiePlayer.setAttribute('speed', '1');
                                lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                                lottiePlayer.setAttribute('loop', 'none');
                                lottiePlayer.setAttribute('autoplay', '');
                                lottiePlayer.setAttribute('direction', '1');
                                lottiePlayer.setAttribute('mode', 'normal');

                                // Ajoute le player dans le conteneur
                                enemyContainer.appendChild(lottiePlayer);
                                
                                setTimeout(() => {
                                    lottiePlayer.remove();
                                }, 1200);
                                loadSound("assets/sound/bow.mp3");
                                damageVibration("enemyContainer");
                                updateLifeEnemyGauge(2);
                                foot.removeEventListener("click", foothit);
                            }

                            foot.addEventListener("click", foothit);
                            
                           
                        }
                        else
                        {
                            const lottiePlayer = document.createElement('lottie-player');

                            lottiePlayer.setAttribute('src', 'assets/animation/Cross.json');
                            
                            lottiePlayer.setAttribute('background', 'transparent');
                            lottiePlayer.setAttribute('speed', '1');
                            lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: 0; right: 0; bottom: 0; margin: auto;');
                            lottiePlayer.setAttribute('loop', 'none');
                            lottiePlayer.setAttribute('autoplay', '');
                            lottiePlayer.setAttribute('direction', '1');
                            lottiePlayer.setAttribute('mode', 'normal');
        
                            // Ajoute le player dans le conteneur
                            enemyContainer.appendChild(lottiePlayer);
                            
                            setTimeout(() => {
                                lottiePlayer.remove();
                            }, 1200);
                            loadSound("assets/sound/bow.mp3");
                            damageVibration("enemyContainer");
                        }
                    
                }
                
                if (enemies.name === "Basgialiscu" && element.name == "Arc")
                {
                    setTimeout(() => {
                        weaponsBloc.innerHTML = `<div class="weaponsBloc"><div class="weapons" style="background-color: rgb(232, 230, 202);"><p class="txtTitle">Epée</p></div><div class="weapons" style="background-color: rgb(237, 206, 142);"><p class="txtTitle">Grimoire</p></div><div class="weapons" style="background-color: rgb(207, 136, 27);"><p class="txtTitle">Arc</p></div></div>`;
                        weaponsBloc.classList.remove("y-area2");
                        weaponsBloc.classList.add("y-area");
                    disableInteractions();
                if(hp <= 0)
                    {
                        console.log("Vous avez gagné");

                        createnewEndingOverlay("Vous avez gagné !");

                        ajouterBouton('fightContainer', '', 'btnInv1', "btnInv");

                        const btnInv1 = document.getElementById("btnInv1")
                        //--------------PSEUDO-------------------------
                        // Ajoute un écouteur d'événement "click" au bouton Submit
                        btnInv1.addEventListener("click", function () {
                            fightContainer.remove();
                            resolve('win');
                        });
                    }
                    else
                    {
                        setTimeout(() => {
                            createnewOverlay("Au tour de l'ennemi !");
                        }, 750)


                        setTimeout(() => {
                            damageVibration("playerContainer");
                            const lottiePlayer = document.createElement('lottie-player');
                            lottiePlayer.setAttribute('src', 'https://lottie.host/fd1e19de-61e5-4d5c-a92e-0055281ad242/NIaUP3FEHA.json');
                            lottiePlayer.setAttribute('background', 'none');
                            lottiePlayer.setAttribute('speed', '1');
                            lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: -50px; margin-right: auto;');
                            lottiePlayer.setAttribute('loop', '');
                            lottiePlayer.setAttribute('autoplay', '');
                            lottiePlayer.setAttribute('direction', '1');
                            lottiePlayer.setAttribute('mode', 'normal');

                            playerContainer.appendChild(lottiePlayer);

                            setTimeout(() => {
                                lottiePlayer.remove();
                            }, 1700);
                            loadSound("assets/sound/bunch.mp3");
                            updateLifeGauge(enemies.damage);
                        }, 4990);
                        
                        setTimeout(() => {

                            if(pHp <= 0)
                            {
                                setTimeout(() => {
                                console.log("Vous avez perdu");

                                createnewEndingOverlay("Vous avez perdu !");

                                ajouterBouton('fightContainer', '', 'btnInv2', "btnInv");

                                const btnInv2 = document.getElementById("btnInv2")
                                //--------------PSEUDO-------------------------
                                // Ajoute un écouteur d'événement "click" au bouton Submit
                                btnInv2.addEventListener("click", function () {
                                    fightContainer.remove();
                                    resolve('loose');
                                });
                            }, 500);
                                
                            }
                            else
                            {
                                //remove EventListener
                                

                                fighting();

                                setTimeout(() => {
                                    createnewOverlay("C'est ton tour !");
                                }, 700)
                            }
                         }, 5500);
                    }
                    }, 7000);
                }
                else
                {
                updateLifeEnemyGauge(element.damage);
                disableInteractions();
                if(hp <= 0)
                    {
                        console.log("Vous avez gagné");

                        createnewEndingOverlay("Vous avez gagné !");

                        ajouterBouton('fightContainer', '', 'btnInv1', "btnInv");

                        const btnInv1 = document.getElementById("btnInv1")
                        //--------------PSEUDO-------------------------
                        // Ajoute un écouteur d'événement "click" au bouton Submit
                        btnInv1.addEventListener("click", function () {
                            fightContainer.remove();
                            resolve('win');
                        });
                    }
                    else
                    {
                        setTimeout(() => {
                            createnewOverlay("Au tour de l'ennemi !");
                        }, 750)


                        setTimeout(() => {
                            damageVibration("playerContainer");
                            const lottiePlayer = document.createElement('lottie-player');
                            lottiePlayer.setAttribute('src', 'https://lottie.host/fd1e19de-61e5-4d5c-a92e-0055281ad242/NIaUP3FEHA.json');
                            lottiePlayer.setAttribute('background', 'none');
                            lottiePlayer.setAttribute('speed', '1');
                            lottiePlayer.setAttribute('style', 'width: 300px; height: 300px; position: absolute; top:0; left: -50px; margin-right: auto;');
                            lottiePlayer.setAttribute('loop', '');
                            lottiePlayer.setAttribute('autoplay', '');
                            lottiePlayer.setAttribute('direction', '1');
                            lottiePlayer.setAttribute('mode', 'normal');

                            playerContainer.appendChild(lottiePlayer);

                            setTimeout(() => {
                                lottiePlayer.remove();
                            }, 1700);
                            loadSound("assets/sound/bunch.mp3");
                            updateLifeGauge(enemies.damage);
                        }, 4990);
                        
                        setTimeout(() => {

                            if(pHp <= 0)
                            {
                                setTimeout(() => {
                                console.log("Vous avez perdu");

                                createnewEndingOverlay("Vous avez perdu !");

                                ajouterBouton('fightContainer', '', 'btnInv2', "btnInv");

                                const btnInv2 = document.getElementById("btnInv2")
                                //--------------PSEUDO-------------------------
                                // Ajoute un écouteur d'événement "click" au bouton Submit
                                btnInv2.addEventListener("click", function () {
                                    fightContainer.remove();
                                    resolve('loose');
                                });
                            }, 500);
                                
                            }
                            else
                            {
                                //remove EventListener
                                

                                fighting();

                                setTimeout(() => {
                                    createnewOverlay("C'est ton tour !");
                                }, 700)
                            }
                         }, 5500);
                    }
                }

                
                
            }
            weapon.addEventListener("click", hit);
                
                
                // updateLifeGauge(enemies.damage);
                
        });
     };

    });

}