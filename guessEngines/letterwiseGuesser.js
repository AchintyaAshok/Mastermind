var common = require("../lib/common");

function letterWiseGuesser(socket, hintStr, corpus){
  console.log("Initializing letter-wise-guesser");
}

function handleGuessResponse(response){
  console.log("letterWiseGuesser::handleResponse()");
  var details = common.parseMessage(response);
}

function nextGuess(){
  console.log("letterWiseGuesser::nextGuess()");
}

module.exports = {
  initGuessEngine:      letterwiseGuesser
  nextGuess:            nextGuess,
  handleGuessResponse:  handleResponse,
};
