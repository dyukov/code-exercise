const Rx = require('rx');
const EventEmitter = require('events').EventEmitter;

// Export a function that wraps any database query changefeed into
// RX observable
module.exports = (queryObject) => {

// TODO: Make use of RxNode
// const RxNode = require('rx-node');
//var subscription = RxNode.fromReadLineStream(queryObject.changes({includeInitial: true, includeStates: true, includeTypes: true}), 'data')

const eventEmitter = new EventEmitter()
const observable = Rx.Observable.fromEvent(eventEmitter, 'data')

//  message.old_val, next: message.new_val
// [prev, next]

// type: 'add'
// type: 'change'

queryObject.changes({includeInitial: true, includeStates: true, includeTypes: true}).run().then(function(cursor){
  cursor.on("data", function(message) {
      if(message.type != 'state')
      eventEmitter.emit('data', message)
  }),
  cursor.on("error", function(message) {
     // TODO : Log error - do not emit up the stack
     // eventEmitter.emit("error", message)
  })
});

return observable;
};
