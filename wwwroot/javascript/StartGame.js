"use strict";

//variables needed
let arrColors = ["gold", "yellowgreen", "darkorange", "cyan", "blueviolet",
    "darkgray", "white", "darkred", "blue", "magenta", "steelblue", "tan",
    "lightseagreen", "yellow", "chartreuse", "indianred", "khaki",
    "dimgray", "darkgreen", "green", "mediumorchid", "violet",
    "limegreen", "papayawhip", "lavender", "lightcyan"];
    

let colorCount;
let positionCount;
let doubles;
let guesser;
//let codeToGuess = [];
//let guessedCode = [];
let usedColors = [];
let positionInOwnCode = 0;
//let guess = 0;
//let allGuessedCodes = [];
//allGuessedCodes[0] = [];
//let red = 0;
//let white = 0;
//let doubleguesses = 0;
//let impossibleCodes = 0;
//let autosolve = false;
let allPossibleCodes = [];
//let rand;
let maxPossibleCodes;
//let bgcl = $("#idCode").css("background-color");
let maxCodesToBruteForce = 90000;



//on Start
function startGame() {
    //apply settings
    applySettings();

    //create the area where code is entered
    createColorButtons();
    createInputField();

    //apply different rules depending on who guesses
    if (guesser == "Computer") {
        $(".plGuess").hide();
    } else {
        $(".cpGuess").hide();
        createCode(codeToGuess);
        putSolutionOnField();
        $("#idAnswer").show();
        $("#spielfeld").show();
    }

    $("#settingsSet").hide();
    $("#idCode").show();

    //do all codes
    createAllPossibleCodes();
}

function applySettings() {
    colorCount = $("#idAnzFarben").val();
    colorCount = Number(colorCount);
    positionCount = $("#idAnzStecker").val();
    positionCount = Number(positionCount);

    //playing with doubles requires different rules for code-creating
    //so I need to check if the player wants doubles
    doubles = true;
    const cb = document.getElementById('idDoubles'); //for some reason this doesn't work when I try using jQuery
    if (!cb.checked) {
        if (Number(colorCount) < Number(positionCount)) {
            alert("Because you chose less colors than positions there will be multiple use of the same colors.");
        }
        else
            doubles = false;
    }

    maxPossibleCodes = calculatePossibleCodes();

    //depending on who does the guessing, different rules apply
    const radio = document.getElementById('pl');
    if (radio.checked)
        guesser = "Player";
    else
        guesser = "Computer";

    displaySettings();
}

function createColorButtons() {
    for (let i = 0; i < colorCount; i++) {
        //I can put i as a paramater in the onclick function if I write the html in a string
        let s = "<button class='pickColor'onclick='addColorToCode(" + i + ")'></button>";
        $("#addStuffHere").before(s)
        $(".pickColor")[i].style.backgroundColor = arrColors[i];
        $(".pickColor").css("padding", "10px");
    }
}

function createInputField() {
    for (let i = 0; i < positionCount; i++) {
        $("#idTable").after("<td class='ownCode'></td>");
    }
    $(".ownCode")[positionInOwnCode].style.border = "4px solid white";
}

function createCode(code) {
    //I need an array that I can alter if doubles
    for (let i = 0; i < colorCount; i++) {
        usedColors[i] = arrColors[i];
    }

    let useCount = colorCount;
    for (let i = 0; i < positionCount; i++) {
        let rand = Math.floor(Math.random() * useCount);
        code[i] = usedColors[rand];
        if (!doubles) {
            usedColors.splice(rand, 1); //discard the color just used
            useCount--;
        }
    }
}

function putSolutionOnField() {
    let tdList = "";
    for (let i = 0; i < positionCount; i++) {
        tdList += "<td class='code'></td>";
    }
    $("#idGuessedCode").before("<table id='idShowCode'><tr><td class='tabletext'>code</td>" + tdList + "</tr></table>");
    for (let i = 0; i < positionCount; i++) {
        $(".code")[i].style.backgroundColor = codeToGuess[i];
    }
}

function createAllPossibleCodes() {
    //anzahl berechnen
    let totalCount = 1;
    for (let i = 0; i < positionCount; i++) {
        totalCount *= (colorCount);
    }

    if (totalCount <= maxCodesToBruteForce) {
        //Arrays erstellen
        for (let i = 0; i < totalCount; i++) {
            allPossibleCodes[i] = [];
        }

        //codes erstellen
        let max = 1;

        //for jede spalte i 
        for (let i = 0; i < positionCount; i++) {
            let colIndex = 0;
            let counter = 0;

            //für jeden möglichen code
            for (let j = 0; j < totalCount; j++) {
                //vergib die farbe
                allPossibleCodes[j][i] = arrColors[colIndex];
                //und zähle weiter
                counter++;
                //max berechnet, wie oft hintereinander die gleiche farbe verwendet wird
                //codemäßig. 111, 112, 113 - an der 3. stelle wird jedes mal raufgezählt
                //an der zweiten erst dann, wenn max erreicht ist

                if (counter == max) {
                    colIndex++;
                    if (colIndex == colorCount) {
                        colIndex = 0;
                    }
                    counter = 0;
                }
            }
            //und für die nächste spalte ist das max dann höher
            max *= colorCount;
        }

        if (!doubles) {
            removeDoubles();
        }
    }
}

function displaySettings() {
    let settings = colorCount + " colors <br>"
        + positionCount + " digits <br>doubles: " + doubles
        + "<br>" + guesser + " guesses <br><br>";
    if (guesser == "Player") {
        settings += maxPossibleCodes + " possible combinations";
    }
    document.getElementById("idSettings").innerHTML = settings;
}

function removeDoubles() {
    let codesToDrop = [];
    let codeCount = 0;
    let dropCode;
    //let doubles;

    //check all possible codes if they are still possible
    for (let j = 0; j < allPossibleCodes.length; j++) {
        dropCode = false;

        for (let i = 0; i < positionCount; i++) {
            let currCol = allPossibleCodes[j][i];
            for (let k = i + 1; k < positionCount; k++) {
                if (allPossibleCodes[j][k] == currCol) {
                    codesToDrop[codeCount] = j;
                    dropCode = true;
                }
            }
        }
        //wenn mehrere codes den gerade aktiven ausschließen, dann überschreibt er sich halt selbst
        if (dropCode) {
            codeCount++;
        }
    }

    //drop now invalid codes in reverse order, as to not interrupt the order
    for (let i = codesToDrop.length - 1; i >= 0; i--) {
        allPossibleCodes.splice(codesToDrop[i], 1);
    }

    $("#idPossible").text("codes possible: " + allPossibleCodes.length);
}









