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
    r.db('ClientTestTablesDb').tableCreate('ClientTestTable').then((change) => {
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
