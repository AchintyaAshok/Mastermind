var common = require("../lib/common");

// Members for this guess engine
var indexForWords = {};
var lengthBuckets = [];
var corpus;
// The WS Client that we send messages through
var client;
var initStateDate = false; // this checks if we've initialized the state of all our data

/* This function takes the corpus and generates two things.
1. Generates lists of words that are grouped by their length.
2. For each word, it gets the 'word index' for that word.
*/
function generateCorpusIndex(corpus){
  // first bucket them by length
  for(var i=0; i<corpus.length; ++i){
    var word = corpus[i];
    var wordLength = word.length;
    while(lengthBuckets.length < wordLength){
      lengthBuckets.push([]); // need more buckets to accomodate the length of this word
    }
    lengthBuckets[wordLength - 1].push(word); // group all words of same length
  }

  // for each word, keep a map of word -> word-index
  this.indexForWords = {};

  for(var i=0; i<lengthBuckets.length; ++i){
    var bucket = lengthBuckets[i];
    for(var j=0; j<bucket.length; ++j){
      var bucketWord = bucket[j];
      if(indexForWords[bucketWord] !== undefined) continue; // already evaluated this word
      var bucketWordIndex = generateIndexForWord(bucketWord, bucket);
      indexForWords[bucketWord] = bucketWordIndex;
    }
  }
}

/* This function generates an index for a word by comparing it to all
other words in the word list. It then maps each word pair to the comparison score.
It will return a score list for the input word. This score list will contain
all words that have 0..n letters in common with the key word (n is also the index
in the score list). Ex. @ index 2, all words have 2 letters 'in common' with the key */
function generateIndexForWord(word, wordList){
  var scoreList = [];
  for(var i=0; i<=word.length; ++i) scoreList.push([]);
  for(var i=0; i<wordList.length; ++i){
    var compareWord = wordList[i];
    if(word === compareWord) continue;
    var comparisonScore = calculateSimilarityScore(word, compareWord);
    scoreList[comparisonScore].push(compareWord); // keep track of the score this word pertains to
  }
  return scoreList;
}

/* Returns a number indicating the number of common letters between the
first and second parameters. In order for a letter to be common, it must
in the same place in both strings. */
function calculateSimilarityScore(first, second){
  if(first.length != second.length) throw("inputs are of different lengths");
  var score = 0;
  for(var i=0; i<first.length; i++){
    if(first[i] === second[i]) ++score;
  }
  return score;
}

/* The constructor for the Phrase Guesser Guess Engine. */
function phraseGuesser(wsClient, corpus){
  console.log("Initializing phrase-guesser [PG]");
  client = wsClient;
  generateCorpusIndex(corpus); // generate the corpus index off the bat
}

/* This generates the next guess using the engine logic and then messages
the server with the guess using the Web Socket Client passed in upon instantiation
of the Guess Engine */
function nextGuess(){
  console.log("phrase-guesser::nextGuess()");
  client.send("hello world");
}

/* The generic handler that is exposed to the caller that will handle messages
for guesses from the server. This will determine the state of the guess then
trigger the next most appropriate guess. */
function handleMessage(response){
  console.log("phrase-guesser::handleResponse()");
  var details = common.parseMessage(response);
  console.log("[PG] message details:", details);
  if(!initStateDate){
    console.log("[PG] initializing state data");
    // this is the first server message we're getting!
    initStateData = true;
  }
  nextGuess();
}

module.exports = {
  initGuessEngine:  phraseGuesser,
  handleMessage:    handleMessage
};
