(function () {
    var model = {
        boardSize: 10, // размер сетки
        numShips: 10, // количество кораблей
        shipsSunk: 0, // Потопленые корабли
        hitNum: 0,
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
            { locations: [], hits: [""] }],
        fire: function (gues) {
            for(var p = 0; p < this.numShips; p++){
                var ship = this.ships[p];

                if( ship.locations.indexOf(gues) >= 0){
                    ship.hits[ship.locations.indexOf(gues)] = 'hit';
                    this.hitNum++;

                    view.displayHit(gues);
                    view.displayHits();
                    view.displayMessage('Попадание');

                    if(this.isSunk(ship)){
                        view.displayMessage('Поздравляю, Вы потопили корабль!');
                        this.shipsSunk++;
                        view.displayShipsSunk(this.shipsSunk);
                    }
                    return true;
                }
            }
            view.displayMiss(gues);
            view.displayMessage('Промах');
            return false;
        },
        isSunk: function(ship){
            for(var i = 0; i < ship.locations.length; i++){
                if(ship.hits[i] !== 'hit'){
                    return false;
                }
            }
            return true;
        },
        generateShipsLocation: function () {
            var index = 0; // индекс для последовательного добавления кораблей в массив locations

            for(var n = 0; n <= 4; n++) {
                var deck = model.modelShip[n];

                for (var i = 0; i < n; i++) {
                    do {
                        var shipCoord = this.generateShips(i, deck);
                    } while (this.colisions(shipCoord));

                    this.ships[index].locations = shipCoord;
                    index++;
                }
            }
        },
        generateShips: function (i, deck) {
            var ships = [];
            var direction, verticalCord, horizonalCord;

            direction = Math.floor(Math.random() * 2);

            if(direction === 1){
                verticalCord = Math.floor(Math.random() * (this.boardSize - deck));
                horizonalCord = Math.floor(Math.random() * this.boardSize);
            }
            else if(direction === 0){
                verticalCord = Math.floor(Math.random() * this.boardSize);
                horizonalCord = Math.floor(Math.random() * (this.boardSize - deck));
            }

            for(var j = 0; j < deck; j++){
                if(direction === 1){
                    verticalCord += 1;
                }else {
                    horizonalCord += 1;
                }
                ships.push(verticalCord + '' + horizonalCord);
            }
            return ships;
        },
        colisions: function (shipCoord) {
            for(var i = 0; i < model.numShips; i++){
                var ship = this.ships[i];

                for(j = 0; j < shipCoord.length; j++){
                    if(ship.locations.indexOf(shipCoord[j]) >= 0) return true;

                    var x = +shipCoord[j].charAt(0);
                    var y = +shipCoord[j].charAt(1);

                    // проверка верх/низ/право/лево
                    if(ship.locations.indexOf((x + 1) + '' + y) >= 0) return true;
                    if(ship.locations.indexOf((x - 1) + '' + y) >= 0) return true;
                    if(ship.locations.indexOf(x + '' + y - 1) >= 0) return true;
                    if(ship.locations.indexOf(x + '' + (1 + y)) >= 0) return true;

                    // проверка диагоналей
                    if(ship.locations.indexOf((x + 1) + '' + (1 + y)) >= 0) return true;
                    if(ship.locations.indexOf((x - 1) + '' + (y - 1)) >= 0) return true;
                    if(ship.locations.indexOf((x) + '' + (y - 1)) >= 0) return true;
                    if(ship.locations.indexOf((1 + x) + '' + (y - 1)) >= 0) return true;
                    if(ship.locations.indexOf((x - 1) + '' + (1 + y)) >= 0) return true;
                    if(ship.locations.indexOf((1 + x) + '' + (1 + y)) >= 0) return true;
                }
            }
            return false;
        },
        locateShip: function () {
            // Функция, показывает рассположение кораблей

            var td = field.getElementsByTagName('td');
            for(var k = 0; k < model.numShips; k++){
                for(var i = 0; i < model.numShips; i++){
                    for(var j = 0; j < td.length; j++){
                        if(td[j].dataset.index === model.ships[k].locations[i]){
                            td[j].className = 'ship';
                        }
                    }
                }
            }
        }
    };


    var view = {
        displayMessage: function(msg){
            var messageArea = document.getElementById('message');
            messageArea.innerHTML = msg;

        },
        displayHit: function (location) {
            var td = document.querySelectorAll('td');
            for(i = 0; i < td.length; i++){
                if(td[i].dataset.index === location){
                    td[i].className = 'hit';
                }
            }
        },
        displayMiss: function (location) {
            var td = document.querySelectorAll('td');
            for(i = 0; i < td.length; i++){
                if(td[i].dataset.index === location){
                    td[i].className = 'miss';
                }
            }
        },
        displayHits: function () {
            var hitNum = document.getElementById('hitNum');
            hitNum.innerHTML = model.hitNum;
        },
        displayGuesses: function (guesses) {
            var guessesText = document.getElementById('guesses');
            guessesText.innerHTML = guesses;
        },
        displayShipsSunk: function (numShipsSunk) {
            var text = document.getElementById('shipsSunk');
            text.innerHTML = numShipsSunk;
        },
        displayResult: function () {
            var textResult = document.getElementById('result');
            clearTimeout(startTimer);
            textResult.innerHTML = 'Поздравляю, Игра закончена!';


        }

    };
    var controller = {
        guesses: 0,
        processGuesees: function(gues){
            this.guesses ++;

            view.displayGuesses(this.guesses); // Запись количества выстрелов
            var hit = model.fire(gues);

            if(model.shipsSunk === model.numShips){
                view.displayResult();
            }
        }
    };

    var sec = 0;
    var min = 0;

    function timer() {
        var secund = document.getElementById('sec');
        var minutes = document.getElementById('min');

        if(sec === 60){
            sec = 0;
            min++;
        }
        if(sec < 10){
            secund.innerHTML = '0' + '' + sec;
        }else{
            secund.innerHTML = sec;
        }
        if(min < 10){
            minutes.innerHTML = '0' + '' + min;
        }else {
            minutes.innerHTML = min;
        }

        if(min === 60){
            min = 0;
        }
        sec++;
    };

    // Создаем игровое поле
    var table = document.createElement('table');
    for(j = 0; j < model.boardSize; j++){
        var tr = document.createElement('tr');

        for(var i = 0; i < model.boardSize; i++){
            var td = document.createElement('td');
            td.setAttribute('data-index', j +'' + i);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    field.insertBefore(table, field.firstElementChild.nextSibling);

    var shots = [];
    //Получаем номер ячейки куда кликнули
    table.onclick = function (event) {

        var target = event.target;
        if(target.tagName != 'TD') return;

        if(model.shipsSunk === model.numShips) return;

        // Проверка на выстрелы в ячейку
        if(shots.indexOf(target.getAttribute('data-index')) < 0){
            shots.push(target.getAttribute('data-index'));
            controller.processGuesees(target.getAttribute('data-index'));
        }
    };
    model.generateShipsLocation();
    var startTimer = setInterval(timer, 1000);
})();