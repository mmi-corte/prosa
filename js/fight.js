export function lunchFight(weapons, enemies)
{
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
}