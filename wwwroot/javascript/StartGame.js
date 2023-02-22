"use strict";

//variables needed



//on Start
function startGame() {
    //apply settings
    applySettings(); //✔

    //create the area where code is entered
    createColorButtons(); //✔
    createInputField();//✔

    //apply different rules depending on who guesses
    //mainly what to show and what to hide

    if (guesser == "Player") {
        createCode(codeToGuess);
        putSolutionOnField();
    }
    setUpFieldForGame();

    //do all codes
    maxPossibleCodes = calculatePossibleCodes(); //needed for the display
    createAllPossibleCodes();

    displaySettings();//✔
}

/* Apply cholsen settings at the start of the game:
 * number of colors
 * number of slots
 * use of double colors in code
 * who guesses
 * */
function applySettings() {

    //* number of colors
    colorCount = $("#idAnzFarben").val();
    colorCount = Number(colorCount);

    //* number of slots
    positionCount = $("#idAnzStecker").val();
    positionCount = Number(positionCount);

    //* use of double colors in code
    doubles = false;
    const cb = document.getElementById('idDoubles'); //for some reason this doesn't work when I try using jQuery
    if (cb.checked) doubles = true;
    else if (Number(colorCount) < Number(positionCount)) {
        alert("Because you chose less colors than positions there will be multiple use of the same colors.");
        doubles = true;
    }

    //* who guesses
    const radio = document.getElementById('pl');
    if (radio.checked)
        guesser = "Player";
    else
        guesser = "Computer";
}

/*adds the color buttons to pick the code based on the settings
 * and adds them before the invisible <hr> with the id "addStuffHere"
 */
function createColorButtons() {
    for (let i = 0; i < colorCount; i++) {
        //I can put i as a paramater in the onclick function if I write the html in a string
        let s = "<button class='pickColor'onclick='addColorToCode(" + i + ")'></button>";
        $("#addStuffHere").before(s)
        $(".pickColor")[i].style.backgroundColor = arrColors[i];
    }
}

/*Adds <td>s according to slot count to the table where own code is displayed and marks current position*/
function createInputField() {
    for (let i = 0; i < positionCount; i++) {
        $("#idTable").after("<td class='ownCode'></td>");
    }
    $(".ownCode")[positionInOwnCode].style.border = "4px solid white";
}

/*hides or shows areas/elements on the page based on the settings */
function setUpFieldForGame() {
 if (guesser == "Computer") {
        $(".plGuess").hide();
    } else {
        $(".cpGuess").hide();        
        $("#idAnswer").show();
        $("#spielfeld").show();
    }
    $("#settingsSet").hide();
    $("#idCode").show();
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


/*calculates the amount of total possible codes based on the settings
 * if it' with doubles, it's colors^slots
 * else it's a calculation similar to colors! that starts at colors but ends as soon as all slots are colored*/
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

/*Constructs the string for displaying the settings
 * and writes it into the section*/
function displaySettings() {
    let settings = colorCount + " colors <br>"
        + positionCount + " digits <br>doubles: " + doubles
        + "<br>" + guesser + " guesses <br><br>";
    if (guesser == "Player") {
        settings += maxPossibleCodes + " possible combinations";
    }
    document.getElementById("idSettings").innerHTML = settings;
}







