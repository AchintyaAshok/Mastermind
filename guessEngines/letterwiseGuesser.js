var common = require("../lib/common");

function letterwiseGuesser(socket, corpus){
  console.log("Initializing letter-wise-guesser");
}

function handleMessage(response){
  console.log("letterWiseGuesser::handleMessage()");
  var details = common.parseMessage(response);
}

function nextGuess(){
  console.log("letterWiseGuesser::nextGuess()");
}

module.exports = {
  initGuessEngine:  letterwiseGuesser,
  handleMessage:    handleMessage,
};
