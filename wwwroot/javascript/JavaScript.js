﻿"use strict";


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
createAllPossibleCodes();
        cpGuesses();
    }
}

function takeGuess() {
    if (guess == 0) createAllPossibleCodes();
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



function cpGuesses() {
    guess++;
    do {
        guessedCode = createCode();
    } while (guess>1 && !checkIfCodeIsValid())

  
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

/* Creates a random Code based on possible colors 
 * 
 
 */
function createCode() {
    //I need an array that I can alter if doubles
    let newCode = [];
    let usedColors = [];
    let useCount = colorCount;

    //fill temporary array with possible colors
    for (let i = 0; i < colorCount; i++) {
        usedColors[i] = arrColors[i];
    }

    for (let i = 0; i < positionCount; i++) {
        let rand = Math.floor(Math.random() * useCount);
        //set color in code to ranom possible color
        newCode[i] = usedColors[rand];
        if (!doubles) {
            usedColors.splice(rand, 1); //discard the color just used
            useCount--;
        }
    }
    return newCode;
}


/* This function was created to reduce randomness in computer guessing
 * if the total possible codes doesn't exceed 90k, 
 * all codes are brute forced into an array  */
function createAllPossibleCodes() {
    if (maxPossibleCodes <= maxCodesToBruteForce) {
        //Arrays erstellen
        for (let i = 0; i < maxPossibleCodes; i++) {
            allPossibleCodes[i] = [];
        }

        //codes erstellen
        let max = 1;

        //for jede spalte i 
        for (let i = 0; i < positionCount; i++) {
            let colIndex = 0;
            let counter = 0;

            //für jeden möglichen code
            for (let j = 0; j < maxPossibleCodes; j++) {
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


function checkIfCodeIsValid() {
    let valid = true;

    //if(guess>1)
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



function reload() {
    //easiest way to get rid of all the added stuff for a new game: reload the page
    location.reload();
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



