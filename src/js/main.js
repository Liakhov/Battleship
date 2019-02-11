    const adminShots = [],
          userShots = [];

    const model = {
      boardSize: 10,
      numShips: 10,
      shipsSunk: 0,
      hitNum: 0
    };
    const user = {
        name: 'user',
        guesses: 0,
        numShipsSunk: 0,
        shipsSunk: 0,
        hitNum: 0,
        numShips: 10,
        modelShip: ['', 4, 3, 2, 1],
        ships: [{locations: [], hits: ["", "", "", ""]},
            {locations: [], hits: ["", "", ""]},
            {locations: [], hits: ["", "", ""]},
            {locations: [], hits: ["", ""]},
            {locations: [], hits: ["", ""]},
            {locations: [], hits: ["", ""]},
            {locations: [], hits: [""]},
            {locations: [], hits: [""]},
            {locations: [], hits: [""]},
            {locations: [], hits: [""]}]
    };

    const admin = {
        name: 'admin',
        guesses: 0,
        numShipsSunk: 0,
        shipsSunk: 0,
        hitNum: 0,
        numShips: 10,
        modelShip: ['', 4, 3, 2, 1],
        ships: [ { locations: [], hits: ["", "", "", ""] },
            { locations: [], hits: ["", "", ""] },
            { locations: [], hits: ["", "", ""] },
            { locations: [], hits: ["", ""] },
            { locations: [], hits: ["", ""] },
            { locations: [], hits: ["", ""] },
            { locations: [], hits: [""] },
            { locations: [], hits: [""] },
            { locations: [], hits: [""] },
            { locations: [], hits: [""] }]
    };

    // Cоздаем игровое поле
    function createField(profile) {
        let table = document.createElement('table');
        for (let j = 0; j < model.boardSize; j++) {
            let tr = document.createElement('tr');
            for (let i = 0; i < model.boardSize; i++) {
                let td = document.createElement('td');
                td.setAttribute('data-index', j + '' + i);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        table.id = profile;
        document.getElementById('field').appendChild(table);
    }
    createField('user');
    createField('admin');


    function displayHit(location, player) {
        let td = document.getElementById(player.name).querySelectorAll('td');
        for (let i = 0; i < td.length; i++) {
            if (td[i].dataset.index === location) {
                td[i].className = 'hit';
            }
        }
    }
    function displayMiss(location, player) {
      let td = document.getElementById(player.name).querySelectorAll('td');
      for (let i = 0; i < td.length; i++) {
          if (td[i].dataset.index === location) {
              td[i].className = 'miss';
          }
      }
    }

    function isSunk(ship) {
      for (let i = 0; i < ship.locations.length; i++) {
          if (ship.hits[i] !== 'hit') {
              return false;
          }
      }
      return true;
    }

    function fire(gues, player) {
      for (let p = 0; p < player.numShips; p++) {
          let ship = player.ships[p];

          if (ship.locations.indexOf(gues) >= 0) {
              ship.hits[ship.locations.indexOf(gues)] = 'hit';
              player.hitNum++;
              displayHit(gues, player);
              displayHits(player);
              displayMessage('Попадание');
              if(controller.activePlayer === 'admin'){
                  setTimeout(randomFire, 1000)
              }
              if (isSunk(ship)) {
                  displayMessage(`${player.name} потопил корабль!`);
                  player.shipsSunk++;
                  displayShipsSunk(player.shipsSunk, player);
              }
              return true;
          }
      }
      displayMiss(gues, player);

      if(controller.activePlayer === 'user') {
          controller.activePlayer = 'admin';
          setTimeout(randomFire, 1000);
      }else if(controller.activePlayer === 'admin'){
          controller.activePlayer = 'user';
      }
      displayMessage(`${player.name} промах`);
      return false;
    }

    const controller = {
        activePlayer: 'admin',
        processGuesees(gues, player) {
            player.guesses++;
            displayGuesses(player.guesses, player); // Запись количества выстрелов
            fire(gues, player);
            if (player.shipsSunk === player.numShips) {
                displayResult(player);
            }
        }
    };

    function colisions(shipCoord, player) {
        for (let i = 0; i < model.numShips; i++) {
            let ship = player.ships[i];

            for (let j = 0; j < shipCoord.length; j++) {
                if (ship.locations.indexOf(shipCoord[j]) >= 0) return true;
                let x = +shipCoord[j].charAt(0);
                let y = +shipCoord[j].charAt(1); // проверка верх/низ/право/лево

                if (ship.locations.indexOf(x + 1 + '' + y) >= 0) return true;
                if (ship.locations.indexOf(x - 1 + '' + y) >= 0) return true;
                if (ship.locations.indexOf(x + '' + y - 1) >= 0) return true;
                if (ship.locations.indexOf(x + '' + (1 + y)) >= 0) return true; // проверка диагоналей

                if (ship.locations.indexOf(x + 1 + '' + (1 + y)) >= 0) return true;
                if (ship.locations.indexOf(x - 1 + '' + (y - 1)) >= 0) return true;
                if (ship.locations.indexOf(x + '' + (y - 1)) >= 0) return true;
                if (ship.locations.indexOf(1 + x + '' + (y - 1)) >= 0) return true;
                if (ship.locations.indexOf(x - 1 + '' + (1 + y)) >= 0) return true;
                if (ship.locations.indexOf(1 + x + '' + (1 + y)) >= 0) return true;
            }
        }
        return false;
    }

    function generateShips(deck) {
        let ships = [];
        let direction, verticalCord, horizonalCord;
        direction = Math.floor(Math.random() * 2);

        if (direction === 1) {
            verticalCord = Math.floor(Math.random() * (model.boardSize - deck));
            horizonalCord = Math.floor(Math.random() * model.boardSize);
        } else if (direction === 0) {
            verticalCord = Math.floor(Math.random() * model.boardSize);
            horizonalCord = Math.floor(Math.random() * (model.boardSize - deck));
        }
        for (let j = 0; j < deck; j++) {
            if (direction === 1) {
                verticalCord += 1;
            } else {
                horizonalCord += 1;
            }
            ships.push(verticalCord + '' + horizonalCord);
        }
        return ships;
    }
    function generateShipsLocation(player) {
        let index = 0, shipCoord, deck;

        for (let n = 0; n <= 4; n++) {
            deck = player.modelShip[n];
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
      let td = document.getElementById(fieldClass).getElementsByTagName('td');
      for (let k = 0; k < player.numShips; k++) {
          for (let i = 0; i < player.numShips; i++) {
              for (let j = 0; j < td.length; j++) {
                  if (td[j].dataset.index === player.ships[k].locations[i]) {
                      td[j].className = 'ship';
                  }
              }
          }
      }
    }


    generateShipsLocation(user);
    generateShipsLocation(admin);
    locateShip(admin, 'admin');

    function randomFire() {
        var shot, x, y;
        do{
            x = Math.floor(Math.random() * model.boardSize);
            y = Math.floor(Math.random() * model.boardSize);
            shot = x + '' + y;
        }while(adminShots.indexOf(shot) >= 0);

        // Проверка на выстрел в ячейку
        if(adminShots.indexOf(shot) < 0){
            controller.processGuesees(shot, admin);
            adminShots.push(shot);
        }
    }

    function game() {
        setTimeout(randomFire, 1500);
    }

    document.getElementById('start').onclick = function (){
        game();
    };

    const userFiels = document.getElementById('user');

    userFiels.onclick = function (event) {
        let target = event.target;
        if(target.tagName != 'TD' || user.shipsSunk === user.numShips  || controller.activePlayer != 'user') return;
        // Проверка на выстрелы в ячейку
        if(userShots.indexOf(target.getAttribute('data-index')) < 0){
            userShots.push(target.getAttribute('data-index'));
            controller.processGuesees(target.getAttribute('data-index'), user);
        }
    };

    // Display functions
    function displayHits(player) {
        if(player.name === 'user'){
            document.getElementsByClassName('user__hitNum')[0].innerHTML = user.hitNum;
        }else if(player.name === 'admin'){
            document.getElementsByClassName('admin__hitNum')[0].innerHTML = admin.hitNum;
        }
    }
    function displayGuesses(guesses, player) {
        if(player.name === 'user'){
            document.getElementsByClassName('user__guesses')[0].innerHTML = guesses;
        }else if(player.name === 'admin'){
            document.getElementsByClassName('admin__guesses')[0].innerHTML = guesses;
        }
    }
    function displayMessage(msg) {
        document.getElementById('message').innerHTML = msg;
    }
    function displayShipsSunk(numShipsSunk, player) {
        if(player.name === 'user'){
            document.getElementsByClassName('user__shipsSunk')[0].innerHTML = numShipsSunk;
        }else if(player.name === 'admin'){
            document.getElementsByClassName('admin__shipsSunk')[0].innerHTML = numShipsSunk;
        }
    }
    function displayResult(player) {
        document.getElementById('result').innerHTML = `Победил ${player.name}, игра закончена!`
    }


