const { expect, assert } = require('chai');
const { client } = require('../src/');

describe('#client', () => {

  let r;

  before(async () => {
    r = await client();
    await r.dbCreate('ClientTestTablesDb');
  });

  // WORKING WITH DATABASES
  it('should create Database', (done) => {
    r.dbCreate('ClientTestDb').then((change) => {
      expect(change.dbs_created).to.equal(1);
      done()
    })
  })

  it('should drop Database', (done) => {
    r.dbDrop('ClientTestDb').then((change) => {
      expect(change.dbs_dropped).to.equal(1);
      done()
    })
  })

// TEST WORKING WITH TABLES
  it('should create table', (done) => {
    r.db('ClientTestTablesDb').tableCreate('ClientTestTable').run().then((change) => {
      expect(change.tables_created).to.equal(1);
      done()
    })
  })

  it('should add new document', (done) => {
    r.db('ClientTestTablesDb')
    .table('ClientTestTable')
    .insert({value: 'New item'})
    .then((change) => {
      expect(change.deleted).to.equal(0);
      expect(change.errors).to.equal(0);
      expect(change.inserted).to.equal(1);
      expect(change.replaced).to.equal(0);
      expect(change.skipped).to.equal(0);
      expect(change.unchanged).to.equal(0);
      done()
    })
  })


  it('should update document', (done) => {
    r.db('ClientTestTablesDb')
    .table('ClientTestTable').filter({value: 'New item'}).limit(1)
    .update({value: 'ANOTHER VALUE'})
    .then((change) => {
      expect(change.deleted).to.equal(0);
      expect(change.errors).to.equal(0);
      expect(change.inserted).to.equal(0);
      expect(change.replaced).to.equal(1);
      expect(change.skipped).to.equal(0);
      expect(change.unchanged).to.equal(0);
      done()
    })
  })

  it('should delete document', (done) => {
    r.db('ClientTestTablesDb')
    .table('ClientTestTable').filter({value: 'ANOTHER VALUE'}).limit(1)
    .delete()
    .then((change) => {
      expect(change.deleted).to.equal(1);
      expect(change.errors).to.equal(0);
      expect(change.inserted).to.equal(0);
      expect(change.replaced).to.equal(0);
      expect(change.skipped).to.equal(0);
      expect(change.unchanged).to.equal(0);
      done()
    })
  })


  it('should add document with complicated data types', (done) => {
    r.db('ClientTestTablesDb')
    .table('ClientTestTable')
    .insert({string: 'String of text',
             number: 900,
             boolean: false,
             null: null,
             object: {a:1, b:"b", c: null, d:{ 1:"0", 2:3 }},
             array: [1,2,3,4, "five", "six"],
             one_pint_location: r.point(60.162046,24.920228)})
    .then((change) => {
      expect(change.deleted).to.equal(0);
      expect(change.errors).to.equal(0);
      expect(change.inserted).to.equal(1);
      expect(change.replaced).to.equal(0);
      expect(change.skipped).to.equal(0);
      expect(change.unchanged).to.equal(0);
      done()
    })
  })


// Location tests
  it('should get correct distance between points', (done) => {
    // NOTE: Rethink DB returns 18km
    //       Google says: 9km
    // Home Latitude:60.144728° Longitude:24.650552° // Google Maps:  60.145478, 24.652728
    // Business Buttler Latitude:60.144728° Longitude:24.650552°  Google Maps: 60.187631, 24.806193
    r.db('ClientTestTablesDb')
    .table('ClientTestTable')
    .insert([{id: 1, string: 'Home', location: r.point(60.145478, 24.652728)},
             {id: 2, string: 'Business Buttler', location: r.point(60.187631, 24.806193)}]).run()
    .then((change) => {
      expect(change.inserted).to.equal(2);
      r.db('ClientTestTablesDb').table('ClientTestTable')
         .get(1)('location')
         .distance(r.db('ClientTestTablesDb').table('ClientTestTable')
                    .get(2)('location'), {unit: 'km'})
         .run().then(distance => {
          expect(Math.floor(distance)).to.equal(17)
          done()
        })
     })
  })


  it('should delete table', (done) => {
    r.db('ClientTestTablesDb').tableDrop('ClientTestTable').then((change) => {
      expect(change.tables_dropped).to.equal(1);
      done()
    })
  })

  after(async () => {
    await r.dbDrop('ClientTestTablesDb')
    await r.getPoolMaster().drain()
  });
});
