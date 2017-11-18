const { expect, assert } = require('chai');
const { client, feed } = require('../src/');

describe('#feed', () => {

  let r;
  let s;

  before(async () => {
    r = await client();
    await r.tableCreate('test');
  });

  // NOTE: Simple example
  it('should return query changefeed observable', (done) => {

    // Create an observable changefeed from query
    s = feed(
    // Pass in any database query
      r.table('test').filter({value: 'somevalue'})
    )
    // Subscribe to changes
    .subscribe(change => {
    // Example change object:
    // {
    //   type: 'update',
    //   old_val: {<old_valious value>},
    //   new_val: {<new value>}
    // }
      expect(change.type).to.equal('add');
      expect(change.new_val.value).to.equal('somevalue');
    // Will timeout if subscribe doesn't work properly
      done();
    });

    // Perform example insert
    setTimeout(function() {
      r.table('test').insert({value: 'somevalue'}).run();
    }, 1000); 

  //  causes 'race condition' with item added before
   //  r.table('test').insert({value: 'somevalue'});
  });

  // TODO: Add test case for 'insert'
  //

  // TODO: Add test case for 'update'
  //

  // TODO: Add test case for 'delete'
  //

  // TODO: Add other test cases
  //

  after(async () => {
    await r.tableDrop('test');
    await r.getPoolMaster().drain();
    s.dispose();
  });
});
