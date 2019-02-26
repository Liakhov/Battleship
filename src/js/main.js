let model = {
    boardSize: 10,
    numShips: 10,
    shipsSunk: 0,
    hitNum: 0,
    activePlayer: "admin",
    modelShip: ["", 4, 3, 2, 1]
};
class User {
    constructor(name) {
        this.name = name;
        this.guesses = 0;
        this.numShipsSunk = 0;
        this.shipsSunk = 0;
        this.arrHits = [];
        this.teritoryHits = [];
        this.hitNum = 0;
        this.shots = [];
        this.ships = [
            { locations: [], hits: ["", "", "", ""] },
            { locations: [], hits: ["", "", ""] },
            { locations: [], hits: ["", "", ""] },
            { locations: [], hits: ["", ""] },
            { locations: [], hits: ["", ""] },
            { locations: [], hits: ["", ""] },
            { locations: [], hits: [""] },
            { locations: [], hits: [""] },
            { locations: [], hits: [""] },
            { locations: [], hits: [""] }
        ];
    }
}

let user = new User("user");
let admin = new User("admin");
admin.currentShots =  false;
admin.secondSuccesShot = [];
admin.sucesShots = 0;

// Cоздаем игровое поле
function createField(profile) {
    let table = document.getElementById(profile);

    for (let j = 0; j < model.boardSize; j++) {
        let tr = document.createElement("tr");
        for (let i = 0; i < model.boardSize; i++) {
            let td = document.createElement("td");
            td.setAttribute("data-index", j + "" + i);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}
createField("user");
createField("admin");

function displayHit(location, player) {
    let td = document.getElementById(player.name).querySelectorAll("td");
    for (let i = 0; i < td.length; i++) {
        if (td[i].dataset.index === location) {
            td[i].className = "hit";
            maskHit(td[i], player);
        }
    }
}
let maskArr = [];
function maskHit(item, player) {
    let x = +item.dataset.index[0];
    let y = +item.dataset.index[1];
    let td = document.getElementById(player.name).querySelectorAll("td");
    maskArr = [ `${1 + x}${1 + y}`,  `${x - 1}${y - 1}`,  `${1 + x}${y - 1}`,  `${x - 1}${1 + y}` ];
    for (let j = 0; j < maskArr.length; j++) {
        for (let i = 0; i < td.length; i++) {
            if (td[i].dataset.index === maskArr[j]) {
                if(td[i].className.length === 0) td[i].className = "mask";
                if (player.name === "admin") admin.shots.push(td[i].dataset.index);
            }
        }
    }
    maskArr.length = 0;
}
let displayMiss = (location, player) => {
    let td = document.getElementById(player.name).querySelectorAll("td");
    td.forEach(item => {
        if (item.dataset.index === location) item.className = "miss";
    });
};
let isSunk = ship => {
    for (let i = 0; i < ship.locations.length; i++) {
        if (ship.hits[i] !== "hit") return false;
    }
    return true;
};
function fire(gues, player) {
    displayGuesses(player); // Запись количества выстрелов

    for (let p = 0; p < model.numShips; p++) {
        let ship = player.ships[p];

        if (ship.locations.indexOf(gues) >= 0) {
            ship.hits[ship.locations.indexOf(gues)] = "hit";
            player.hitNum++;
            displayHit(gues, player);
            displayHits(player);
            displayMessage("Попадание");

            if (model.activePlayer === "admin" && !isSunk(ship)) {
                if (admin.currentShots) {
                    admin.sucesShots++;
                    admin.secondSuccesShot.push(gues);
                    setTimeout(superClever, 1000);
                } else {
                    admin.currentShots = true;
                    admin.sucesShots++;
                    admin.secondSuccesShot.push(gues);
                    admin.arrHits.push(gues);
                    setTimeout(cleverShot, 1000);
                }
            }
            if (isSunk(ship)) {
                displayMessage(`${player.name} потопил корабль!`);
                admin.currentShots = false; // умный выстрел
                admin.arrHits.length = 0;
                admin.teritoryHits.length = 0;
                admin.secondSuccesShot.length = 0;
                admin.sucesShots = 0; // попадания подряд
                player.shipsSunk++;
                displayShipsSunk(player.shipsSunk, player);
                if (player.shipsSunk === model.numShips) {
                    displayResult(player);
                    return true;
                }
                return model.activePlayer === "user" ? true : setTimeout(gunning, 500);
            }
            return true;
        }
    }
    displayMiss(gues, player);

    if (model.activePlayer === "user") {
        model.activePlayer = "admin";
        setTimeout(gunning, 1000);
    } else if (model.activePlayer === "admin") {
        model.activePlayer = "user";
    }
    displayMessage(`${player.name} промах`);
    return false;
}

function colisions(shipCoord, player) {
    for (let i = 0; i < model.numShips; i++) {
        let ship = player.ships[i];
        for (let j = 0; j < shipCoord.length; j++) {
            if (ship.locations.indexOf(shipCoord[j]) >= 0) return true;
            let x = +shipCoord[j].charAt(0);
            let y = +shipCoord[j].charAt(1); // проверка верх/низ/право/лево/диагонали

            let colisionArr = [
                `${x + 1}${y}`,  `${x - 1}${y}`,  `${x}${y - 1}`,  `${x}${1 + y}`,  `${x + 1}${1 + y}`,
                `${x - 1}${y - 1}`,  `${x}${y - 1}`,  `${1 + x}${y - 1}`,  `${x - 1}${1 + y}`,  `${1 + x}${1 + y}`
            ];
            for(let k = 0; k < colisionArr.length; k++){
                if(ship.locations.indexOf(colisionArr[k]) >= 0) return true;
            }
        }
    }
    return false;
}
function generateShips(deck) {
    let ships = [], direction, verticalCord, horizonalCord;
    direction = Math.floor(Math.random() * 2);

    if (direction === 1) {
        verticalCord = Math.floor(Math.random() * (model.boardSize - deck));
        horizonalCord = Math.floor(Math.random() * model.boardSize);
    } else if (direction === 0) {
        verticalCord = Math.floor(Math.random() * model.boardSize);
        horizonalCord = Math.floor(Math.random() * (model.boardSize - deck));
    }
    for (let j = 0; j < deck; j++) {
        direction === 1 ? (verticalCord += 1) : (horizonalCord += 1);
        ships.push(`${verticalCord}${horizonalCord}`);
    }
    return ships;
}
function generateShipsLocation(player) {
    let index = 0,  shipCoord,  deck;
    for (let n = 0; n <= 4; n++) {
        deck = model.modelShip[n];
        for (let i = 0; i < n; i++) {
            do {
                shipCoord = generateShips(deck);
            } while (colisions(shipCoord, player));
            player.ships[index].locations = shipCoord;
            index++;
        }
    }
}
function locateShip(player, fieldClass) {
    let td = document.getElementById(fieldClass).getElementsByTagName("td");
    for (let k = 0; k < model.numShips; k++) {
        for (let i = 0; i < model.numShips; i++) {
            for (let j = 0; j < td.length; j++) {
                if (td[j].dataset.index === player.ships[k].locations[i]) td[j].className = "ship";
            }
        }
    }
}
generateShipsLocation(user);
generateShipsLocation(admin);
locateShip(admin, "admin");
locateShip(user, "user");

function gunning() {
    if (!admin.currentShots) {
        let shot, x, y;
        do {
            x = Math.floor(Math.random() * model.boardSize);
            y = Math.floor(Math.random() * model.boardSize);
            shot = x + "" + y;
        } while (admin.shots.indexOf(shot) >= 0);

        // Проверка на выстрел в ячейку
        if (admin.shots.indexOf(shot) < 0) {
            fire(shot, admin);
            admin.shots.push(shot);
        }
    } else if(admin.secondSuccesShot.length > 1) {
        superClever();
    }else{
        cleverShot();
    }
}
function cleverShot() {
    if (admin.teritoryHits.length === 0) { // Проверка масива на заполеность клеток для обстрела
        let clerverArr = [], // Масив обстрела клеток по снизу, сверху, справа, слева
            td = admin.arrHits[0],
            x = Number(td.charAt(0)),
            y = Number(td.charAt(1));

        clerverArr = [ `${x}${1 + y}`,  `${x}${y - 1}`,  `${1 + x}${y}`,  `${x - 1}${y}` ];

        for(let i = 0; i < clerverArr.length; i++){
            if(clerverArr[i] < 100 && clerverArr[i] > 0) admin.teritoryHits.push(clerverArr[i]);
        }
        clerverArr.length = 0;
    }
    let shot, rand;
    do {
        //Проверка на последний елемент масива
        if (admin.teritoryHits.length === 1) {
            rand = 0;
            shot = admin.teritoryHits[rand];
            break;
        }
        rand = Math.floor(Math.random() * admin.teritoryHits.length);
        shot = admin.teritoryHits[rand];
        if (shot < 0 || shot > 99) admin.teritoryHits.splice(rand, 1);
    } while (admin.shots.indexOf(shot) >= 0);

    // Проверка на выстрел в ячейку
    if (admin.shots.indexOf(shot) < 0) {
        fire(shot, admin);
        admin.shots.push(shot);
        admin.teritoryHits.splice(rand, 1);
    } else {
        admin.teritoryHits.splice(rand, 1);
    }
}
let randSuperClever;
function superClever() {
    let firringArr = [...admin.secondSuccesShot];
    let superCleverArr = [];
    firringArr.sort((a, b) => a > b ? 1 : -1 );

    let x = firringArr[0];
    let y = firringArr[firringArr.length - 1];
    if (x.charAt(0) === y.charAt(0)) { // Horizontal
        if (x.charAt(1) === "0") {
            superCleverArr.push(`${y.charAt(0)}${Number(y.charAt(1)) + 1}`);
        } else if (y.charAt(1) === "9") {
            superCleverArr.push(`${x.charAt(0)}${x.charAt(1) - 1}`);
        } else {
            superCleverArr.push(`${x.charAt(0)}${x.charAt(1) - 1}`);
            superCleverArr.push(`${y.charAt(0)}${Number(y.charAt(1)) + 1}`);
        }
    } else { // Vertical
        if (x.charAt(0) === "0") {
            superCleverArr.push(`${1 + Number(y.charAt(0))}${y.charAt(1)}`);
        } else if (y.charAt(0) === "9") {
            superCleverArr.push(`${x.charAt(0) - 1}${x.charAt(1)}`);
        } else {
            superCleverArr.push(`${x.charAt(0) - 1}${x.charAt(1)}`);
            superCleverArr.push(`${1 + Number(y.charAt(0))}${y.charAt(1)}`);
        }
    }
    let shot;
    if (superCleverArr.length === 1) {
        shot = superCleverArr[0];
        if (admin.shots.indexOf(shot) < 0) { // Проверка на выстрел в ячейку
            fire(shot, admin);
            admin.shots.push(shot);
            admin.teritoryHits.splice(0, 1);
        } else {
            admin.teritoryHits.splice(randSuperClever, 1);
        }
    } else if (superCleverArr.length > 1) {
        do {
            if (superCleverArr.length === 1) { //Проверка на последний елемент масива
                shot = superCleverArr[0];
            } else {
                randSuperClever = Math.floor(Math.random() * superCleverArr.length);
                shot = superCleverArr[randSuperClever];
            }
        } while (admin.shots.indexOf(shot) >= 0);
        if (admin.shots.indexOf(shot) < 0) {
            fire(shot, admin);
            admin.shots.push(shot);
            admin.teritoryHits.splice(randSuperClever, 1);
        } else {
            admin.teritoryHits.splice(randSuperClever, 1);
        }
    }
}
document.getElementById("user").onclick = function(event) {
    let target = event.target;
    if (target.tagName != "TD" || user.shipsSunk === model.numShips || model.activePlayer != "user") return;

    if (user.shots.indexOf(target.getAttribute("data-index")) < 0) { // Проверка на выстрелы в ячейку
        user.shots.push(target.getAttribute("data-index"));
        fire(target.getAttribute("data-index"), user);
    }
};
function displayHits(player) {
    if (player.name === "user") {
        document.getElementsByClassName("user__hitNum")[0].innerHTML = user.hitNum;
    } else if (player.name === "admin") {
        document.getElementsByClassName("admin__hitNum")[0].innerHTML = admin.hitNum;
    }
}
function displayGuesses(player) {
    player.guesses++;
    if (player.name === "user") {
        document.getElementsByClassName("user__guesses")[0].innerHTML = player.guesses;
    } else if (player.name === "admin") {
        document.getElementsByClassName("admin__guesses")[0].innerHTML = player.guesses;
    }
}
function displayMessage(msg) {
    document.getElementById("message").innerHTML = msg;
}
function displayShipsSunk(numShipsSunk, player) {
    if (player.name === "user") {
        document.getElementsByClassName("user__shipsSunk")[0].innerHTML = numShipsSunk;
    } else if (player.name === "admin") {
        document.getElementsByClassName("admin__shipsSunk")[0].innerHTML = numShipsSunk;
    }
}
function displayResult(player) {
    document.getElementById("message").innerHTML = `Победил ${player.name}, игра закончена!`;
}
document.getElementById("start").onclick = () => setTimeout(gunning, 1500);
document.getElementById("reload").onclick = () => location.reload();