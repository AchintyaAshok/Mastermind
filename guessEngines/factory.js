var PhraseGuesser     = require("./phraseGuesser");
var LetterwiseGuesser = require("./letterwiseGuesser");
// add any other engines here...

// Sets the type of the factory to the guess engine provided
function init(type){
  console.log("[Factory]::init()");
  if(type === "phraseGuesser"){
    return PhraseGuesser;
  }
  else if(type == "LetterwiseGuesser"){
    return LetterwiseGuesser;
  }
  // add any other guess engines here
  else{
    throw("Guess Engine provided is not defined!");
  }
}

module.exports = {
  init: init,
};
