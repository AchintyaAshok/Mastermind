// Implementation of a mock websocket client

var EventEmitter = require('events').EventEmitter;

var eventsHandler; // the instance of the EventEmitter passed to this library upon init

function init(eventEmitter){
  eventsHandler = eventEmitter;
  eventsHandler.emit('initClient');
}

/* invokes the appropriate code in the mock server to interpret the guess
and sends a 'response' back via the handler method. */
function send(message){
  console.log("[Client]\tSending message");
  eventsHandler.emit('clientSendMessage', message);
}

module.exports = {
  init: init,
  send: send,
};
