const { expect, assert } = require('chai');
const { client, feed } = require('../src/');
const RxObservable = require('rx').Observable;

describe('#feed', () => {

  let r;
  let s;
  let tableTitle = "test_" + Date.now();

  before(async () => {
    r = await client();
    await r.tableCreate(tableTitle);
    r.table(tableTitle).insert([
            {value: 'existing1'}, 
            {value: 'existing2'}, 
            {value: 'existing3', existingData: "000"},
            {value: 'to be updated'},
            {value: 'to be deleted'}]).run(); 
  });


  // Return Rx.Observable from changefeed
  it('should return Rx.Observable from changefeed query', (done) => {
    let observable = feed(r.table(tableTitle))
    expect(observable instanceof RxObservable).to.equal(true)
    done();
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
  it('should return correct observable for added row ("ADD")', (done) => {
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

  // TODO: Fix this
  // Unhandled rejection ReqlDriverError: None of the pools have an opened connection and failed to open a new one
  // Test case for 'update'
  it('should return correct observable for updating row ("CHANGE")', (done) => {
   s = feed(r.table(tableTitle).filter({value: 'existing3'} ))
            .filter(change => change.type === 'change')
            .subscribe(change => {
              expect(change.type).to.equal('change');
              expect(change.new_val.newData).to.equal('newly added data');
              expect(change.new_val.existingData).to.equal('001');
              expect(change.old_val.newData).to.equal(undefined);
              expect(change.old_val.existingData).to.equal('000');
          done();
      });

    setInterval(function() {
      r.table(tableTitle).filter({value: 'existing3'}).limit(1).update({newData: 'newly added data', existingData: '001'}).run();
   }, 1000);
  });

  // Test case for 'delete'
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


  xit('should return correct observable for FILTER based on Value', (done) => {
    s = feed(r.table(tableTitle).filter(row => row('value').match("^existing")))
        .subscribe(change => {
          console.log("cc-c-c-hange");
          console.log(change);
         // expect(change.new_val).to.equal(null);
         // expect(change.old_val.value).to.equal('to be deleted');
        done();
      });
  });

  after(async () => {
    await r.tableDrop(tableTitle);
    await r.getPoolMaster().drain();
    s.dispose();  
  });
});
