const { client, feed } = require('./src');

// Let's do something cool with observable changefeeds!
// Use your imagination
client().then(r => {

 feed(r.table('test'))
  .filter(change => change.type === 'add') //insert')
  .map(change => change.next)
  .subscribe(item => {
    console.log('this item was inserted: ', item);
  });

 feed(r.table('test'))
  .filter(change => change.type === 'change') // 'update')
  .map(change => [change.prev, change.next])
  .subscribe(([prev, next]) => {
    console.log('this item was updated: ', prev, 'with new value: ', next);
  });

 feed(r.table('test'))
  .filter(change => change.type === 'initial')
  .map(change => change.next)
  .subscribe(item => {
    console.log('this item was already in table: ', item);
  });


 

  setInterval(() => {
    r.table('test').insert({value: 'foo'}).run();
  }, 2000);

  setInterval(() => {
    r.table('test').filter({value: 'foo'}).limit(1).update({value: 'bar'}).run();
  }, 2000);
})
.catch(e => {
  console.log('oops', e);
});
