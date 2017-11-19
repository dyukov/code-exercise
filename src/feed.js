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

  queryObject.changes({includeInitial: true, includeTypes: true}).run().then(cursor => {  
    cursor.on('data', message => {
      eventEmitter.emit('data', message)
    }),
    cursor.on('error', err => {
      console.log("Error:")
      console.log(err)
    })
  });

  return observable;
};
