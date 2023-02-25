﻿"use strict";

//called when button "New Game" is clicked
function reload() {
    //easiest way to get rid of all the added stuff for a new game: reload the page
    location.reload();
}

//#region startGame
//introduction
/* On starting the game:
 (clicking button "Start Game" on the "set settings" part of the page)

~~~ applySettings ~~~
 Set global variable values according to chosen settings 
 * colorCount:      number of colors
 * positionCount:   number of slots
 * doubles:         use of double colors in code
 * guesser:         "Player" || "Computer"
 
~~~ createColorButtons ~~~
* creates colored buttons to pick the code
  and adds them before the invisible <hr> with the id "addStuffHere"

~~~ createInputField ~~~
* Adds <td>s according to slot count to the table to display own code
* marks current position

=== if player is guessing, code is created and put on field here, else it's done later ===
~~~ codeToGuess = createCode() ~~~
call method from 
!!!
!!!
(whatever file will be called in the end) to generate a random code
!!!
!!!
and set it as value for global variable codeToGuess

~~~ putSolutionOnField ~~~
* write the Solution in a hidden area so it can be displayed on button click 
===========================================================================================

~~~ setUpFieldForGame ~~~
* hides or shows areas/elements on the page based on who does the guessing
* hides area to choose settings and shows area to play

~~~ calculatePossibleCodes ~~~
*calculates the amount of total possible codes
 so it can be shown in the settings display

~~~ displaySettings ~~~
*Constructs the string for displaying the settings
 and writes it into the according section

*/

//main function
function startGame() {
    applySettings(); 

    createColorButtons();
    createInputField();

    if (guesser == "Player") {
        codeToGuess = createCode();
        putSolutionOnField();
    }
    setUpFieldForGame();
    calculatePossibleCodes(); 
    displaySettings();
}

//sub functions
/* Set global variable values chosen settings at the start of the game:
 * number of colors
 * number of slots
 * use of double colors in code
 * who guesses
 * */
function applySettings() {

    //* number of colors and slots
    colorCount = Number($("#idAnzFarben").val());
    positionCount = Number($("#idAnzStecker").val());

    //* use of double colors in code
    doubles = false;
    const cb = document.getElementById('idDoubles'); //for some reason this doesn't work when I try using jQuery
    if (cb.checked) doubles = true;
    else if (colorCount < positionCount) {
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

/* creates colored buttons to pick the code
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

/* Adds <td>s according to slot count to the table to display own code
   and marks current position */
 function createInputField() {
    for (let i = 0; i < positionCount; i++) {
        $("#idTable").after("<td class='ownCode'></td>");
    }
    $(".ownCode")[positionInOwnCode].style.border = "4px solid white";
}

/* write the Solution in a hidden area 
   so it can be displayed on button click */
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

/* hides or shows areas/elements on the page based on who does the guessing,
 hides area to choose settings and shows area to play */
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
    maxPossibleCodes = totalCount;
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

//#endregion

//#region PlayerCodeBeforeFirstTurn 

//introduction
/* If the computer does the guessing, the player submits a code to be guessed 
   before the game can really start
   this happens after startGame(), so everything else is set already

~~~ checkIfUserCodeIsValid ~~~
returns boolean
 * check if doubles are allowed
 * if not, check if user put in doubles (codeHasDoubleColors)
 * if yes, ask whether to proceed with doubles
 * if yes, update settings
 * return if game can proceed or not
 
~~~ codeHasDoubleColors ~~~
returns boolean
 * loop through the code and see if the current color is used in a different place
  
~~~ startGameForReal ~~~
once a valid codeToGuess is entered, the game can start
 * update UI (show/hide areas)
 * initiate game by letting the computer do the first guess
 */


//main function
function submitCode() {   
    if (checkIfUserCodeIsValid())
        startGameForReal();
}

//sub functions
/* == returns boolean ==
 * check if doubles are allowed
 * if not, check if user put in doubles (codeHasDoubleColors)
 * if yes, ask whether to proceed with doubles
 * if yes, update settings
 * return if game can proceed or not
 */
function checkIfUserCodeIsValid() {
let goAhead = true;
if (!doubles && codeHasDoubleColors()) {
        goAhead = confirm("Your code includes doubles. Do you want that?");
        if (goAhead) {
            doubles = true;
            displaySettings();
        }
    }
    return goAhead;
}

/* == returns boolean ==
 * loop through the code and see if the current color is used in a different place
  */
function codeHasDoubleColors() {
    //for each color in the code
    for (let i = 0; i < positionCount; i++) {
        let currCol = codeToGuess[i];
        //compare the current color to all colors after the current color
        for (let j = i + 1; j < positionCount; j++)
            if (codeToGuess[j] == currCol)
                return true;
    }
    return false;
}

/* once a valid codeToGuess is entered, the game can start:
 * update UI (show/hide areas)
 * initiate game by letting the computer do the first guess*/
function startGameForReal() {
 putSolutionOnField();
        showSolution();
        $("#idCode").hide();
        $("#idAnswer").show();
        $("#spielfeld").show();
        createAllPossibleCodes();
        cpGuesses();
}

//#endregion