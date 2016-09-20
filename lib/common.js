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
    score:    parseInt(message[SCORE_INDEX]),
    state:    parseInt(message[STATE_INDEX])
  });
}

/* Generates a secret phrase from a corpus of words. It will randomly
combine the words from the corpus and return the phrase back. You may
indicate a maximum number of characters that will affect the length of the
randomly generated SECRET phrase. The lengthier it is, the more difficult
it should be to guess. */
function generateSecretPhrase(corpus, maxLength){
  if(corpus.length == 0) throw("No corpus to generate SECRET from!");
  var phrase = "";
  var pre = "";
  var maskedPhrase = "";

  // Generate the phrase and the mask
  while(phrase.length < maxLength){
    var randWord = corpus[Math.floor(Math.random() * corpus.length)]; // pick a random word out of the corpus
    phrase += pre + randWord;
    maskedPhrase += pre;
    for(var i=0; i<randWord.length; ++i) maskedPhrase += "_";
    pre = " "; // only need it for the first iteration
  }
  return {
    secretPhrase: phrase,
    maskedPhrase: maskedPhrase
  };
}

module.exports = {
  parseMessage:         parseMessage,
  generateSecretPhrase: generateSecretPhrase
};
