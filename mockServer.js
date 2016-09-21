// This is an implementation of a mock server that randomly generates a
// phrase that the guess engine needs to guess.
var common = require("./lib/common");

// Event pub is the global eventEmitter passed in, secretPhrase is the phrase
// that the client needs to guess to win, and obscured phrase is just the
// secret phrase with letters masked out with an underscore.
var eventPublisher, corpus, secretPhrase, maskedPhrase;

// State variables
const WON     = 1;
const IN_PLAY = 0;
const LOST    = -1;

function evaluateGuess(guess){
  console.log("[S] Evaluating latest guess '" + guess + "'");
  if(guess === secretPhrase){
    console.log('[S] You won.');
    eventPublisher.emit('serverMessage', maskedPhrase + "\n0\n1");
    eventPublisher.emit('serverClose'); // socket gets closed
    return;
  }
  else{
    console.log("[S] checking score..");
    var score = 0;
    for(var i=0; i<guess.length; ++i){
      if(guess[i] === secretPhrase[i]) ++score
    }
    var message = maskedPhrase + "\n" + score + "\n0";
    eventPublisher.emit('serverMessage', message);
  }
}

/* Constructor for the mock server */
function init(eventPub, corpus, phraseLength){
  eventPublisher = eventPub;
  corpus = corpus;
  var secret = common.generateSecretPhrase(corpus, phraseLength);
  console.log("SECRET: ", secret);
  secretPhrase = secret.secretPhrase;
  maskedPhrase = secret.maskedPhrase;

  // Set the event handler for client guesses
  eventPublisher.on('clientSendMessage', function(message){
    evaluateGuess(message);
  });
  // Indicate that the server is ready
  eventPublisher.emit('initServer');
  var initialMessage = maskedPhrase + "\n0\n0";
  eventPublisher.emit('serverMessage', initialMessage);
}

module.exports = {
  init: init,
};
