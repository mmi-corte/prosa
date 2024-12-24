import { addOverlay } from "./overslay.js";

export function lunchFight(weapons, enemies)
{

    //player hp
    const playerHp = 100;
    var pHp= playerHp;

    //enemy hp var
    var hp = enemies.hp;

    const fightContainer = document.createElement("div");
    const container = document.getElementById("container");
    container.appendChild(fightContainer);
    fightContainer.className = "fightContainer";

    // Create Bg Image
    const bgImage = document.createElement("img");
    bgImage.src = `../assets/bg/bg${enemies.name}.png`; 
    bgImage.className = "bgImage";
    fightContainer.appendChild(bgImage);

    const enemyBloc = document.createElement("div");
    enemyBloc.className = "fightBloc";
    fightContainer.appendChild(enemyBloc);

    const enemyName = document.createElement("p");
    enemyName.className = "txtTitle"
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
        hp = hp-damage;
        lifeEnemyCounter.innerHTML = hp + "/"+ enemies.hp;
        var gaugpourcentage = (100*hp/enemies.hp);
        lifeGauge.style.width = `${gaugpourcentage}%`;
    }

    // Example usage: update life gauge to 50%
    updateLifeEnemyGauge(40);

    // Create Enemy Image

    const enemyContainer = document.createElement("div");
    enemyContainer.className = "enemyContainer";
    fightContainer.appendChild(enemyContainer);

    const enemyImage = document.createElement("img");
    enemyImage.src = `../assets/enemies/${enemies.name}.png`; // Set the source of the image
    enemyImage.className = "enemyImage"; // Add a class for styling
    // Append the image to the enemy container
    enemyContainer.appendChild(enemyImage);

    // Create Player Image

    const playerContainer = document.createElement("div");
    playerContainer.className = "playerContainer";
    fightContainer.appendChild(playerContainer);

    const playerImage = document.createElement("img");
    playerImage.src = `../assets/avatar/avatar.png`; // Set the source of the image
    playerImage.style = 'filter: blur(2px);'
    enemyImage.className = "playerImage"; // Add a class for styling
    // Append the image to the enemy container
    playerContainer.appendChild(playerImage);

    //Create Weapons Bloc

    const weaponsBloc = document.createElement("div");
    weaponsBloc.className = "weaponsBloc";
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
    journalIcon.src = `../assets/icons/journal.png`;
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
    playerName.innerHTML = "Joueur";
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
    updateLifeGauge(50);

    // Create a blocker
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
    const overlay = document.getElementByClassName('overlay')[0];

    function fadeIn(element) {
        element.classList.remove("fade-out");
        element.classList.add("fade-in");
        element.style.display = "block"; // Rendre visible si nécessaire
      }
      
      function fadeOut(element) {
        element.classList.remove("fade-in");
        element.classList.add("fade-out");
        setTimeout(() => {
          element.style.display = "none"; // Cache l'élément après l'animation
        }, 2000); // La durée doit correspondre à celle de l'animation CSS
      }

    fadeIn(overlay);
    
    

    fighting();

    function fighting()
    {
        enableInteractions();
        weapons.forEach((element, key) => {
            const weapon = document.getElementsByClassName("weapons")[key];
            const hit =()=>{
                updateLifeEnemyGauge(element.damage);
                weapon.removeEventListener("click", hit);
                disableInteractions();
                if(hp <= 0)
                    {
                        console.log("Vous avez gagné");
                        return('win');
                        fightContainer.remove();
                    }
                    else
                    {
                        
                        setTimeout(() => {
                            updateLifeGauge(enemies.damage);
                        
                            if(pHp <= 0)
                            {
                                console.log("Vous avez perdu");
                                return('lose');
                                fightContainer.remove();
                            }
                            else
                            {
                                fighting();
                            }
                         }, 2000);
                    }
            }
            weapon.addEventListener("click", hit);
                
                
                // updateLifeGauge(enemies.damage);
                
        });
     };

}