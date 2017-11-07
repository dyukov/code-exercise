const { expect, assert } = require('chai');
const { client } = require('../src/');

describe('#client', () => {

  let r;

  before(async () => {
    r = await client();
  });

  // TODO: Add test cases
  //

  after(async () => {
    await r.getPoolMaster().drain();
  });
});
