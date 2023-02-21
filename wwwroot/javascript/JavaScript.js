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
let codeToGuess = [];
let guessedCode = [];
let usedColors = [];
let positionInOwnCode = 0;
let guess = 0;
let allGuessedCodes = [];
allGuessedCodes[0] = [];
let red = 0;
let white = 0;
let doubleguesses = 0;
let impossibleCodes = 0;
let autosolve = false;
let allPossibleCodes = [];
let rand;
let maxPossibleCodes;
let bgcl = $("#idCode").css("background-color");
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

function displaySettings() {
    let settings = colorCount + " colors <br>"
        + positionCount + " digits <br>doubles: " + doubles
        + "<br>" + guesser + " guesses <br><br>";
    if (guesser == "Player") {
        settings += maxPossibleCodes + " possible combinations";
    }
    document.getElementById("idSettings").innerHTML = settings;
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

function addColorToCode(int) {
    //sets backround color and moves the "active" position to the next position
    $(".ownCode")[positionInOwnCode].style.border = "1px dotted white";
    $(".ownCode")[positionInOwnCode].style.backgroundColor = arrColors[int];
    if (guesser == "Player")
        guessedCode[positionInOwnCode] = arrColors[int];
    else
        codeToGuess[positionInOwnCode] = arrColors[int];
    // $(".pickColor")[positionInOwnCode].hide();
    positionInOwnCode++;
    if (positionInOwnCode < positionCount) //we dont want the script to break due to out of bounds stuff
        $(".ownCode")[positionInOwnCode].style.border = "4px solid white";
}

function undoColor() {
    //it's the reverse of addColorToCode(), obviously
    let bgcl = $("#idCode").css("background-color");
    if (positionInOwnCode > 0) {
        positionInOwnCode--;
        if (positionInOwnCode < positionCount - 1)
            $(".ownCode")[positionInOwnCode + 1].style.border = "1px dotted white";
        $(".ownCode")[positionInOwnCode].style.backgroundColor = bgcl;
        $(".ownCode")[positionInOwnCode].style.border = "4px solid white";
    }
}

function submitCode() {
    //if the user didn't chose doubles but put doubles in, 
    //it will cause problems. so:
    let goAhead;
    if (!doubles) {
        goAhead = checkSubmittedCodeForDoubles();
        if (!goAhead) {
            goAhead = confirm("Your code includes doubles. Do you want that?");
            if (goAhead) {
                doubles = true;

                createAllPossibleCodes();
                displaySettings();
            }
        }
    }
    if (goAhead) {
        putSolutionOnField();
        showSolution();
        $("#idCode").hide();
        $("#idAnswer").show();
        $("#spielfeld").show();

        cpGuesses();
    }
}

function checkSubmittedCodeForDoubles() {

    for (let i = 0; i < positionCount; i++) {
        let currCol = codeToGuess[i];
        for (let j = i + 1; j < positionCount; j++) {
            if (j < positionCount - 1) {
                if (codeToGuess[j] == currCol) {
                    return false;
                }
            }
        }
    }
    return true;
}

function showSolution() {
    if ($("#idBtnSolShow").text() == "show Solution") {
        $("#idShowCode").show();
        $("#idBtnSolShow").text("hide Solution");
    } else {
        $("#idShowCode").hide();
        $("#idBtnSolShow").text("show Solution");
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

function cpGuesses() {
    guess++;
    if (guess > 1) {
        let validCode = false;

        while (!validCode) {
            createCode(guessedCode);
            validCode = checkIfCodeIsValid();
        }
    }
    else
        createCode(guessedCode);

    writeCodeToAllCodes();

    createAndColorTablerow();
    if (autosolve) {
        answer();
        if (guesser == "Player" && autosolve)
            //autosolve check is neccessary in case the code was cracked
            //else the computer will try random codes for all eternity
            cpGuesses();
    }

    //  $("#idDoubleGuesses").text(doubleguesses + " doubleguesses avoided");
    //  $("#idImpossible").text(impossibleCodes + " impossible codes avoided");

}

function checkIfCodeIsValid() {
    let valid = true;

    //all lines need to be checked, start with 1, cause 0 is empty
    for (let i = 1; i < allGuessedCodes.length; i++) {

        //was the same code asked already?
        let sameColorInSamePlace = true;
        for (let j = 0; j < guessedCode.length; j++) {
            if (guessedCode[j] != allGuessedCodes[i][j]) {
                sameColorInSamePlace = false;
            }
        }
        //if all colors of an existing code are the same
        if (sameColorInSamePlace) {
            valid = false;
            doubleguesses++;
            return valid;
        }

        //given all answers, is the code possible?
        calculateAnswer(allGuessedCodes[i], guessedCode);
        if (red != allGuessedCodes[i][positionCount] || white != allGuessedCodes[i][positionCount + 1]) {
            valid = false;
            impossibleCodes++;
            return valid;
        }
    }
    return valid;

}

function writeCodeToAllCodes() {
    allGuessedCodes[guess] = [];
    for (let i = 0; i < guessedCode.length; i++) {
        allGuessedCodes[guess][i] = guessedCode[i];

    }
}

function createAndColorTablerow() {
    //for each color in the guess a <td> needs to be created and styled
    let tdList = "";
    let addClass = "'guessedCode" + guess + "'";
    let getClass = ".guessedCode" + guess;

    //adding a <td> with the class of the current guess to the string
    for (let i = 0; i < positionCount; i++) {
        tdList += "<td class=" + addClass + "></td>";
    }

    //creating the <td>s
    $("#idGuessedCode").after("<table class='putAnswerHere'><tr><td class='tabletext'>" + guess + ". try: </td>" + tdList + "<td class='codeToAnswer'></td></tr></table>");

    //color the created <td>s
    for (let i = 0; i < positionCount; i++) {
        $(getClass)[i].style.backgroundColor = guessedCode[i];
    }
}

function takeGuess() {
    guess++;
    writeCodeToAllCodes();
    createAndColorTablerow();
    answer();

    //reset the code to guess (visual and background information)
    for (let i = 0; i < positionCount; i++) {
        $(".ownCode")[i].style.backgroundColor = bgcl;
        $(".ownCode")[i].style.border = "1px dotted white";
        guessedCode[i] = "black";
    }
    positionInOwnCode = 0;
    $(".ownCode")[0].style.border = "4px solid white";
}

function giveAnswer() {
    // let result = " ";
    let xCount = Number($("#idX").val());
    let oCount = Number($("#idO").val());

    //check if the user answered correctly
    calculateAnswer(guessedCode, codeToGuess);
    if (red != xCount || white != oCount)
        alert("Plz check your answer. There seems to be a mistake.");
    else {
        writeAnswer();

        if (xCount != positionCount) {
            cpGuesses();
        }
    }
}

function answer() {
    calculateAnswer(guessedCode, codeToGuess);
    writeAnswer();
    analyze();
    if (guesser == "Computer" && red != positionCount) {
        cpGuesses();
    }
}

function cpAutosolve() {
    autosolve = true;
    answer();
}

function plAutosolve() {
    autosolve = true;
    cpGuesses();
}

function autoguess() {
    cpGuesses();
    answer();
}

function writeAnswer() {
    //write answer on screen
    let result = " ";
    for (let i = 0; i < red; i++) result += " x";
    for (let i = 0; i < white; i++) result += " o";

    $(".codeToAnswer")[0].append(result);

    //write answer to allCodes
    let posRed = positionCount;         //index der farben geht von 0 bis pos-1
    let posWhite = positionCount + 1;
    allGuessedCodes[guess][posRed] = red;
    allGuessedCodes[guess][posWhite] = white;
}

function analyze() {
    //if all are red... well, then the code is cracked
    if (red == positionCount) {
        if (guesser == "Player")
            $("#idGuessedCode").after("You cracked the code!");
        else
            $("#idGuessedCode").after("Computer cracked the code!");
        $("#idCode").hide();
        $("#idAnswer").hide();
        $("#idBtnSolShow").hide();
        $("#idShowCode").show();
        autosolve = false;
    }
    else {
        removeImpossibleCodes();
    }
}

function calculateAnswer(codeToCheck, codeToCompareWith) {
    red = 0;        //correct place
    white = 0;      //correct color
    let colorsToCheck = [];
    //let checkColor;

    for (let i = 0; i < positionCount; i++) {
        //copy the code to drop already checked colors. we don't want wrong doubles.
        colorsToCheck[i] = codeToCheck[i];
    }

    for (let i = 0; i < positionCount; i++) {
        //check places. that's easy
        if (codeToCheck[i] == codeToCompareWith[i]) red++;

        //check colors without getting false doubles
        let bInCode = false;
        let replaceAtJ;

        for (let j = 0; j < positionCount; j++) {

            if (codeToCompareWith[i] == colorsToCheck[j]) {  //if the color is in
                bInCode = true;
                replaceAtJ = j;         //we will drop it from the code. in only one place.
            }                           //if I drop it here, it will drop all the doubles. we don't want that either.
        }

        //drop the color after the check
        if (bInCode) {
            white++;
            colorsToCheck[replaceAtJ] = "";
        }
    }

    //white is now ALL colors in the code, so I need to remove the amount of red
    white -= red;
}

function calculatePossibleCodes() {
    //anzahl berechnen
    let totalCount = 1;
    //mit doppelten
    if (doubles)
        for (let i = 0; i < positionCount; i++) {
            totalCount *= (colorCount);
        }
    //ohne doppelten
    else {

        let clCt = colorCount;
        for (let i = 0; i < positionCount; i++) {
            totalCount *= (clCt);
            clCt--;
        }
    }
    return totalCount;
}

function reload() {
    //easiest way to get rid of all the added stuff for a new game: reload the page
    location.reload();
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

function removeImpossibleCodes() {

    //the code just asked is obviously no longer valid, elae it would be a win
    allPossibleCodes.splice(rand, 1);

    let codesToDrop = [];
    let codeCount = 0;
    let dropCode;

    //check all possible codes if they are still possible
    for (let j = 0; j < allPossibleCodes.length; j++) {
        dropCode = false;

        //all lines need to be checked, start with 1, cause 0 is empty
        for (let i = 1; i < allGuessedCodes.length; i++) {

            //given all answers, which codes are still possible?
            calculateAnswer(allGuessedCodes[i], allPossibleCodes[j]);

            if (red != allGuessedCodes[i][positionCount] || white != allGuessedCodes[i][positionCount + 1]) {
                codesToDrop[codeCount] = j;
                dropCode = true;
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

    if (maxPossibleCodes < maxCodesToBruteForce)
        //$(".codeToAnswer")[0].append(" - codes possible: " + allPossibleCodes.length);
        $("#idPossible").text("codes possible: " + allPossibleCodes.length);

}



