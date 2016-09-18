// This is an implementation of a mock server that randomly generates a
// phrase that the guess engine needs to guess.
var common = require("lib/common");

// Event pub is the global eventEmitter passed in, secretPhrase is the phrase
// that the client needs to guess to win, and obscured phrase is just the
// secret phrase with letters masked out with an underscore.
var eventPub, secretPhrase, obscuredPhrase;

function evaluateGuess(guess){
  console.log("[S] Evaluating latest guess '" + guess + "'");

}

/* Constructor for the mock server */
function init(eventPublisher, corpus){
  eventPub = eventPublisher;
  var secret = common.generateSecretPhrase();
  secretPhrase = secret.secretPhrase;
  obscuredPhrase = secret.obscuredPhrase;

  // Set the event handler for client guesses
  eventPublisher.on('clientSendMessage', function(message){
    evaluateGuess(message);
  });
  // Indicate that the server is ready
  eventPublisher.emit('initServer');
}

module.exports = {
  init: init,
};
