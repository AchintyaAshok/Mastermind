console.log("Starting mastermind game.");

var path          = require('path');
var EventEmitter  = require('events').EventEmitter; // so we can trigger some async events
var mockServer    = require('./mockServer');
var mockClient    = require('./mockClient');
var common        = require('./lib/common');

const ENGINES_PATH = path.join(__dirname, "guessEngines");
// Different levels of difficulty we can play. "Difficulty" is determined by the length of the secret phrase
const DIFFICULTY = {
  trivial:    [3, 5], // the length of the secret phrase generated
  easy:       [6, 10],
  medium:     [11, 15],
  difficult:  [16, 20],
  insane:     [21, 30]
};

var phraseGuesser     = require(path.join(ENGINES_PATH, "phraseGuesser"));
var letterwiseGuesser = require(path.join(ENGINES_PATH, "letterwiseGuesser"));

var corpus = [ "jello", "am", "golden", "world", "black",
 "green", "hat", "cat", "hello", "champ", "hound",
 "mistake", "fat", "a", "urn", "gnat", "park", "gun",
 "mourn", "chat", "mask", "fun", "cask", "print",
 "prat", "mat", "door", "chore", "gore", "coding",
 "special", "foot", "shoe", "bar", "fool", "angry",
 "hungry", "hung", "match", "box", "green", "day",
 "spleen", "mean", "sky", "why", "can", "pan", "sum",
 "nun", "done", "smack", "flat", "foot", "that", "the",
 "sky", "pie", "churn", "fern", "smear", "guess", "press",
 "mess", "past", "cask", "floor", "oar", "pore", "poor",
 "ate", "paid", "lent", "spent", "gave", "pray", "ran",
 "planned", "spoke", "wrote", "swam", "drove",
];

// var corpus = [ "hello", "world" ];

var guessEngines = [
  "phraseGuesser",
  "letterwiseGuesser"
];

/* The singleton event publisher that's used to asynchronously communicate between mock client and mock server */
var eventPublisher = new EventEmitter();

/* Initialize our server and client */
eventPublisher.on('initServer', function(){
  console.log('Server init()');
  mockClient.init(eventPublisher);
});
eventPublisher.on('initClient', function(){
  console.log('Client init()');
  phraseGuesser.initGuessEngine(mockClient, corpus);
});
eventPublisher.on('serverMessage', function(message){
  phraseGuesser.handleMessage(message);
});
eventPublisher.on('serverClose', function(){
  console.log("\n\t[ -- SERVER CLOSED -- ]\n");
});

// Change this to whatever you please
var myDifficulty = DIFFICULTY.insane;
var phraseLength = Math.floor(Math.random() * (myDifficulty[1] - myDifficulty[0]) + myDifficulty[0]);

// Initialize the server
mockServer.init(eventPublisher, corpus, phraseLength); // initialize the server
