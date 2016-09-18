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
  var phrase = "";
  var pre = " ";
  var maskedPhrase = "";
  // var maskedStub = "____________________"; // a small optimization so that we don't need
  //                                           // to create a stub every iteration with length s
  //                                           // where s is length(w). Rather we'll substr it
  //                                           // and only suffer a copied string
  console.log("Initial phrase length: ", phrase.length);
  while(phrase.length < maxLength){
    var randWord = corpus[Math.floor(Math.random() * corpus.length)]; // pick a random word out of the corpus
    console.log("Rand Word: ", randWord);
    phrase += pre + randWord;
    maskedPhrase += pre;
    for(var i=0; i<randWord.length; ++i) maskedPhrase += "_";
    pre = " "; // only need it for the first iteration
    console.log("phrase new length: ", phrase.length);
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
