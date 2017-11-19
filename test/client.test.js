const { expect, assert } = require('chai');
const { client } = require('../src/');

describe('#client', () => {

  let r;

  before(async () => {
    r = await client();
    await r.dbCreate('ClientTestTablesDb');
  });

  // WORKING WITH DATABASES
  it('should create table', (done) => {
    r.dbCreate('ClientTestDb').then((change) => {
      expect(change.dbs_created).to.equal(1);
      done()
    })
  })

  it('should drop table', (done) => {
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
