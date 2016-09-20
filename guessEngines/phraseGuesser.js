var common  = require("../lib/common");
var Queue   = require("queuejs");

// Since we aren't using es6..
var pgMembers = {
  indexForWords:  {}, // a mapping from each word to all other words of the same length. The mapping indicates the number of letters in common it has with the key.
  lengthBuckets:  [], // a bucket of words where each bucket represents the length of all the words in itself. Ex. [4] -> all five-letter-words (zero-indexed)
  corpus:         [],
  client:         undefined, // this is our websocket client handle
  initStateData:  false, // indicates whether we've processed the initial message from the server yet
  numDelimiters:  0,  // the number of spaces in the hint given to us

  // state variables between guesses
  guessPieces:        [], // each piece of the phrase we have guessed successfully. ["hello", "node"]
  guessPieceLength:   [], // the length of each piece. "_____ ____": [5, 4]
  guessPieceIndex:    0,  // the index of the piece we are currently guessing
  ignoredWords:       {},
  guessQueue:         new Queue(), // we will just push everything into here and evaluate it in FIFO fashion
  lastGuess:          "",
};

/* This function takes the corpus and generates two things.
1. Generates lists of words that are grouped by their length.
2. For each word, it gets the 'word index' for that word.
*/
function generateCorpusIndex(corpus){
  // first bucket them by length
  for(var i=0; i<corpus.length; ++i){
    var word = corpus[i];
    var wordLength = word.length;
    while(pgMembers.lengthBuckets.length < wordLength){
      pgMembers.lengthBuckets.push([]); // need more buckets to accomodate the length of this word
    }
    pgMembers.lengthBuckets[wordLength - 1].push(word); // group all words of same length
  }

  // for each word, keep a map of word -> word-index
  pgMembers.indexForWords = {};

  for(var i=0; i<pgMembers.lengthBuckets.length; ++i){
    var bucket = pgMembers.lengthBuckets[i];
    for(var j=0; j<bucket.length; ++j){
      var bucketWord = bucket[j];
      if(pgMembers.indexForWords[bucketWord] !== undefined) continue; // already evaluated this word
      var bucketWordIndex = generateIndexForWord(bucketWord, bucket);
      pgMembers.indexForWords[bucketWord] = bucketWordIndex;
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
function phraseGuesser(wsClient, givenCorpus){
  console.log("[PG]::init()");
  pgMembers.client = wsClient;
  pgMembers.corpus = givenCorpus;
  generateCorpusIndex(pgMembers.corpus); // generate the corpus index off the bat
}

/* This generates the next guess using the engine logic and then messages
the server with the guess using the Web Socket Client passed in upon instantiation
of the Guess Engine */
function nextGuess(){
  console.log("[PG]::nextGuess()");
  var nextWord = guessQueue.deq();
  while(ignoredWords[nextWord] !== undefined){
    // keep dequeueing until we find the next word
    nextWord = guessQueue.deq();
  }
  console.log("next word: ", nextWord);
  pgMembers.lastGuess = nextWord; // our new 'last guess'

  // now place the word in the position we are evaluating
  // ex. next word = "hello" => "hello _____"
  var guess = "";
  var pre = "";
  for(var i=0; i<pgMembers.guessPieceLength.length; ++i){
    guess += pre;
    if(i == pgMembers.guessPieceIndex){
      guess += nextWord;
    }
    else{
      for(j=0; j<pgMembers.guessPieceLength[i]; ++i) guess += "_";
    }
    pre = " ";
  }
  console.log("next guess: ", guess);
  pgMembers.client.send(guess);
}

/* Evaluates the score of the last guess and then appropriately prunes our choices for
this position. If the word is a perfect match, then we move on to the word in the next position. */
function evaluateLastGuess(score){
  console.log("[PG]::evaluateLastGuess()");
}

/* The generic handler that is exposed to the caller that will handle messages
for guesses from the server. This will determine the state of the guess then
trigger the next most appropriate guess. */
function handleMessage(response){
  console.log("[PG]::handleResponse()");
  var details = common.parseMessage(response);
  console.log("[PG] message details:", details);

  // Initialize any pertinent data for the first pass
  if(!pgMembers.initStateData){
    pgMembers.initStateData = true;
    var pieces = details.hintStr.split(" "); // "_____ _____" => ["_____", "_____"]
    // keep track of the length of each piece
    for(var i=0; i<pieces.length; ++i){
      pgMembers.guessPieceLength.push(pieces[i].length); // determine the length of each piece
    }
    // randomly pick a word that fits the length of the first piece
    var firstWordLength = guessPieceLength[0];
    var validWords = pgMembers.lengthBuckets[firstWordLength - 1]; // 0 indexed
    var firstWord = validWords[Math.floor(Math.random(validWords.length))];
    pgMembers.guessQueue.push(firstWord); // add this to our queue
  }
  else{
    // evaluate how good the last guess was and prune our choices appropriately
    evaluateLastGuess(details.score); // the last score tells us how many letters were matched
  }

  nextGuess();
}

module.exports = {
  initGuessEngine:  phraseGuesser,
  handleMessage:    handleMessage
};
