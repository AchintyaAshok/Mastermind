const HINT_INDEX = 0;
const SCORE_INDEX = 1;
const STATE_INDEX = 2;

/* Parses the message that is received from the server for a guess.
It will return the breakdown in terms of an object with the
hint string, the number of letters correct, and the state of the game. */
function parseMessage(message){
  message = message.split('\n');
  return {
    hintStr:  message[HINT_INDEX],
    score:    message[SCORE_INDEX],
    state:    message[STATE_INDEX];
  }
}

module.export = {
  parseMessage: parseMessage
};
