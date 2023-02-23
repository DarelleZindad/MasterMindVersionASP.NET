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
