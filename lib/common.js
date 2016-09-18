const HINT_INDEX = 0;
const SCORE_INDEX = 1;
const STATE_INDEX = 2;

/* Parses the message that is received from the server for a guess.
It will return the breakdown in terms of an object with the
hint string, the number of letters correct, and the state of the game. */
function parseMessage(message){
  message = message.split('\n');
  return({
    hintStr:  message[HINT_INDEX],
    score:    message[SCORE_INDEX],
    state:    message[STATE_INDEX]
  });
}

/* Generates a secret phrase from a corpus of words. It will randomly
combine the words from the corpus and return the phrase back. You may
indicate a maximum number of characters that will affect the length of the
randomly generated SECRET phrase. The lengthier it is, the more difficult
it should be to guess. */
function generateSecretPhrase(corpus, maxLength){
  if(corpus.length == 0) throw("No corpus to generate SECRET from!");
  return {
    secretPhrase: "hello world",
    maskedPhrase: "_____ _____"
  };
}

module.exports = {
  parseMessage:         parseMessage,
  generateSecretPhrase: generateSecretPhrase
};
