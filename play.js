console.log("Starting mastermind game.");

var path = require("path");

const ENGINES_PATH = path.join(__dirname, "guessEngines");

var phraseGuesser     = require(path.join(ENGINES_PATH, "phraseGuesser"));
var letterwiseGuesser = require(path.join(ENGINES_PATH, "letterwiseGuesser"));

var corpus = [ "jello", "am", "golden", "world", "black",
 "green", "hat", "cat", "hello", "champ", "hound",
 "mistake", "fat", "a", "urn", "gnat", "park", "gun",
 "mourn", "chat", "mask", "fun", "cask", "print"
];

var guessEngines = [
  "phraseGuesser",
  "letterwiseGuesser"
];

var mockServer =

var mockClient = {
  send: function(guess){
    mockServer.checkGuess()
  }
}


phraseGuesser.initGuessEngine(mockClient, "_____ _____", corpus);
phraseGuesser.handleGuessResponse("_____ _____\n1\n0");
phraseGuesser.nextGuess();
