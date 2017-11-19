# Documentation

This module provides a function which wraps Rethink DB changefeed to Rx.Observable
and a client to easily connect to Rethink DB

Example usage:

```
feed(r.table('foo')) → Rx.Observable
```

OR

```
feed(r.table('foo').filter({value: 'bar'}) → Rx.Observable
```

# TODO
* Try Make use of Rx-Node
```
const RxNode = require('rx-node');
var subscription = RxNode.fromReadLineStream(queryObject.changes({includeInitial: true, includeStates: true, includeTypes: true}), 'data')
```

* Fix the // Unhandled rejection ReqlDriverError: None of the pools have an opened connection and failed to open a new one
possible solution : swap 'rethinkdbash' to 'rethinkdb'; 

* more tests
 for cases: https://www.rethinkdb.com/api/javascript/group/


* possible unit tests without real db connection.