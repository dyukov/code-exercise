const { expect, assert } = require('chai');
const { client, feed } = require('../src/');

describe('#feed', () => {

  let r;
  let s;
  let s2;
  let tableTitle = "test_" + Date.now();

  before(async () => {
    r = await client();
    await r.tableCreate(tableTitle);
    r.table(tableTitle).insert([
            {value: 'existing1'}, 
            {value: 'existing2'}, 
            {value: 'existing3', somedata: "aaa"},
            {value: 'to be updated'},
            {value: 'to be deleted'}]).run(); 
  });


  // NOTE: Simple example
  it('should return query changefeed observable', (done) => {

    // Create an observable changefeed from query
    s = feed(
    // Pass in any database query
      r.table(tableTitle).filter({value: 'somevalue'})
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
      r.table(tableTitle).insert({value: 'somevalue'}).run();
    }, 500); 
  });


  // Add test case for 'initial'
  it('should return correct observable for existing row ("INITIAL")', (done) => {
    s = feed(r.table(tableTitle).filter({value: 'existing1'}))
        .subscribe(change => {
          expect(change.type).to.equal('initial');
          expect(change.new_val.value).to.equal('existing1');
        done();
        });
  });

  // Add test case for 'insert'
  it('should return correct observable for row ("ADD")', (done) => {
    s = feed(r.table(tableTitle).filter({value: 'just added'}))
        .subscribe(change => {
          expect(change.type).to.equal('add');
          expect(change.new_val.value).to.equal('just added');
        done();
        });
    
    setTimeout(function() {
      r.table(tableTitle).insert({value: 'just added'}).run();
    }, 1000);
  });

  xit('should return correct observable for updating row ("CHANGE")', (done) => {
    s = feed(r.table(tableTitle).filter({newData: 'here is some new data'}))
        .subscribe(change => {
          console.log(change)
          expect(change.type).to.equal('change');
          expect(change.new_val.value).to.equal('to be updated1');
        done();
        });
    setInterval(function() {
      r.table(tableTitle).insert({value: 'just added 22', freeeText: "sadojfsldjflkasdkfljaslkdjfklasjdflkjasdlkfjlaskdjflksajdf"}).run();
      r.table(tableTitle).filter({value: 'just added 22'}).update({newData: 'here is some new data'}).run();
   }, 500);
  });

  // TODO: Add test case for 'update'
  it('should return correct observable for updating row ("CHANGE")', (done) => {

   s = feed(r.table(tableTitle).filter({value: 'existing3'} ))
            .filter(change => change.type === 'change')
            .subscribe(change => {
              expect(change.type).to.equal('change');
          done();
      });

    setInterval(function() {
      // r.table(tableTitle).insert({value: 'just added 22', freeeText: "sadojfsldjflkasdkfljaslkdjfklasjdflkjasdlkfjlaskdjflksajdf"}).run();
      r.table(tableTitle).filter({value: 'existing3'}).update({newData: 'XXX'}).run();
   }, 500);
  });

  // TODO: Add test case for 'delete'
  it('should return correct observable for row DELETE', (done) => {
    s = feed(r.table(tableTitle).filter({value: 'to be deleted'}))
        .filter(change => change.type === 'remove')
        .subscribe(change => {
          expect(change.new_val).to.equal(null);
          expect(change.old_val.value).to.equal('to be deleted');
        done();
      });
      
    setTimeout(function() {
      r.table(tableTitle).filter({value:'to be deleted'}).delete().run();
    }, 500);
  });

  // TODO: Add other test cases
  //
// function(doc){
//     return doc('name').match("^A")
// }



  after(async () => {
    await r.tableDrop(tableTitle);
    await r.getPoolMaster().drain();
    s.dispose();
  });
});
