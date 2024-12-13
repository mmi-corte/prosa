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
        hp -= damage;
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
            weapons.style = "background-color: #C1BBA9";
        }
        else if(element.name == "Grimoire")
        {
            weapons.style = "background-color: #856495";
        }
        else
        {
            weapons.style = "background-color: #675B39";
        }
    });

    //Create PLayer Life Gauge

    const playerLifeContainer = document.createElement("div");
    playerLifeContainer.className = "playerLifeContainer";
    fightContainer.appendChild(playerLifeContainer);
    // Create image of journal icon
    const journalIcon = document.createElement("img");
    journalIcon.src = `../assets/journal.png`;
    journalIcon.className = "journalIcon";
    playerLifeContainer.appendChild(journalIcon);

    //IMPORTANT

    // Create a life gauge counter
    const lifePlayerCounter = document.createElement("p");
    lifePlayerCounter.className = "txt";
    lifePlayerCounter.id = "lifeCounter2";
    lifePlayerCounter.innerHTML = pHp + "/"+ playerHp;
    playerLifeContainer.appendChild(lifePlayerCounter);

    // Create a life gauge bar
    const playerLifeGauge = document.createElement("div");
    playerLifeGauge.className = "lifeGauge";
    playerLifeContainer.appendChild(playerLifeGauge);

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
    updateLifeGauge(40);
}