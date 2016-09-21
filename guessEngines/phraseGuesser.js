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
  queuedOrIgnored:    {},
  guessQueue:         new Queue(), // we will just push everything into here and evaluate it in FIFO fashion
  lastGuess:          "",
  madeFinalGuess:     false,
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
  console.log("[PG] Guess Queue Size: ", pgMembers.guessQueue.size());
  var nextWord = undefined;
  while(true){
    // keep dequeueing until we find the next word
    nextWord = pgMembers.guessQueue.deq();
    if(pgMembers.queuedOrIgnored[nextWord] === undefined) break;
  }
  if(nextWord === undefined){
    throw("[PG]::nextGuess() - No more words left to check!");
  }
  pgMembers.queuedOrIgnored[nextWord] = true; // mark this word as visited
  pgMembers.lastGuess = nextWord; // our new 'last guess'
  console.log("[PG] next word: ", nextWord);

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
      for(var j=0; j<pgMembers.guessPieceLength[i]; ++j) guess += "_";
    }
    pre = " ";
  }
  console.log("[PG] next guess: ", guess);
  pgMembers.client.send(guess);
}

/* Returns a random word that matches the length of the word that we are trying to
guess */
function getRandomFirstGuess(guessPieceIndex){
  var firstWordLength = pgMembers.guessPieceLength[guessPieceIndex];
  var validWords = pgMembers.lengthBuckets[firstWordLength - 1]; // 0 indexed
  return validWords[Math.floor(Math.random(validWords.length))];
}

/* Evaluates the score of the last guess and then appropriately prunes our choices for
this position. If the word is a perfect match, then we move on to the word in the next position. */
function evaluateLastGuess(score){
  console.log("[PG]::evaluateLastGuess()");
  console.log("[PG] Last guess score: ", score);

  // Check if we got a correct match
  if(score === pgMembers.guessPieceLength[pgMembers.guessPieceIndex]){
    console.log("[PG] Found a piece: [" + pgMembers.guessPieceIndex + "]: ", pgMembers.lastGuess);
    // add this to our string array of correct pieces
    pgMembers.guessPieces.push(pgMembers.lastGuess);
    ++pgMembers.guessPieceIndex;

    // Check if we have found all our pieces, if yes, send the entire guess via the client
    if(pgMembers.guessPieceIndex >= pgMembers.guessPieceLength.length){
      var pre = "";
      var fullGuess = "";
      for(var i=0; i<pgMembers.guessPieces.length; ++i){
        fullGuess += pre;
        fullGuess += pgMembers.guessPieces[i];
        pre = " ";
      }
      console.log("[PG] Final guess: ", fullGuess);
      pgMembers.madeFinalGuess = true;
      pgMembers.client.send(fullGuess);
    }
    else{
      console.log("resetting state variables for next piece");
      // we need to do some cleanup to prepare for the next piece
      pgMembers.queuedOrIgnored = {};
      while(!pgMembers.guessQueue.isEmpty()) pgMembers.guessQueue.deq(); // clear out the guess queue
      pgMembers.guessQueue.enq(getRandomFirstGuess(pgMembers.guessPieceIndex));
    }
  }
  else{
    // anything that has a score less than this is not worth guessing
    var relativeWordAndScore = pgMembers.indexForWords[pgMembers.lastGuess]; //word: 'xz' [0]: ['am', 'bp'], [1]: ['cz', 'dz'], [2]: ['xz']
    if(score === 0){
      // special case, we add all words that absolutely don't match this
      for(var i=0; i<relativeWordAndScore[0].length; ++i){ // all words with 0 matching characters with the last guess
        var word = relativeWordAndScore[0][i];
        if(pgMembers.queuedOrIgnored[word] === undefined){
          pgMembers.guessQueue.enq(word);
        }
      }
    }
    else{
      // we add anything over and above the matching score and remove anything below it
      for(var i=0; i<score; ++i){
        var wordsToIgnore = relativeWordAndScore[i];
        for(var j=0; j<wordsToIgnore.length; ++j){
          var word = wordsToIgnore[j];
          if(pgMembers.queuedOrIgnored[word] === undefined){
            pgMembers.guessQueue.enq(word); // ignore this word
          }
        }
      }
      // add anything >= score
      for(var i=score; i<relativeWordAndScore.length; ++i){
        var wordsToEval = relativeWordAndScore[i];
        for(var j=0; j<wordsToEval.length; ++j){
          var word = wordsToEval[j];
          if(pgMembers.queuedOrIgnored[word] === undefined){
            pgMembers.guessQueue.enq(word);
          }
        }
      }
    }
  }


}

/* The generic handler that is exposed to the caller that will handle messages
for guesses from the server. This will determine the state of the guess then
trigger the next most appropriate guess. */
function handleMessage(response){
  console.log("[PG]::handleResponse()");
  var details = common.parseMessage(response);
  console.log("[PG] message details:", details);

  if(details.state === 1){ // 1 is the winning state
    console.log("[PG] You won.");
    return;
  }
  else if(details.state === -1){ // you lose :(
    console.log("[PG] You lost.")
    return;
  }

  // Initialize any pertinent data for the first pass
  if(!pgMembers.initStateData){
    console.log("[PG] Initializing state data...");
    pgMembers.initStateData = true;
    var pieces = details.hintStr.split(" "); // "_____ _____" => ["_____", "_____"]
    pgMembers.numDelimiters = pieces.length - 1;
    // keep track of the length of each piece
    for(var i=0; i<pieces.length; ++i){
      pgMembers.guessPieceLength.push(pieces[i].length); // determine the length of each piece
    }
    // randomly pick a word that fits the length of the first piece
    pgMembers.guessQueue.enq(getRandomFirstGuess(0)); // add this to our queue
  }
  else{
    // evaluate how good the last guess was and prune our choices appropriately
    evaluateLastGuess(details.score - pgMembers.numDelimiters); // the last score tells us how many letters were matched
  }

  if(details.state !== 1 && !pgMembers.madeFinalGuess){
    nextGuess();
  }
}

module.exports = {
  initGuessEngine:  phraseGuesser,
  handleMessage:    handleMessage
};
