console.log("Starting mastermind game.");

var path          = require("path");
var EventEmitter  = require('events').EventEmitter; // so we can trigger some async events
var mockServer    = require('./mockServer');
var mockClient    = require('./mockClient');

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
  phraseGuesser.handleGuessResponse(message);
});

// Initialize the server
mockServer.init(eventPublisher, corpus); // initialize the server
