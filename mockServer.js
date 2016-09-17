// This is an implementation of a mock server that randomly generates a
// phrase that the guess engine needs to guess.

var eventPub;

/* Constructor for the mock server */
function init(eventPublisher){
  eventPub = eventPublisher;
  eventPublisher.emit('initServer');
}

module.exports = {
  init: init
};
