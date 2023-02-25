
//Arrays
let arrColors = ["gold", "yellowgreen", "darkorange", "cyan", "blueviolet",
    "darkgray", "white", "darkred", "blue", "magenta", "steelblue", "tan",
    "lightseagreen", "yellow", "chartreuse", "indianred", "khaki",
    "dimgray", "darkgreen", "green", "mediumorchid", "violet",
    "limegreen", "papayawhip", "lavender", "lightcyan"];

let codeToGuess = [];
let guessedCode = [];
let allGuessedCodes = [];
allGuessedCodes[0] = [];
let allPossibleCodes = [];

//int
let colorCount;
let positionCount;
let positionInOwnCode = 0;
let guess = 0;
let red = 0;
let white = 0;
let doubleguesses = 0;
let impossibleCodes = 0;
let rand;
let maxPossibleCodes;
let maxCodesToBruteForce = 90000;

//bool
let doubles;
let codeFound = false;

//string
let guesser;

//get the background-color from the css
//used to reset colors in code guessing area
let bgcl = $("#idCode").css("background-color");