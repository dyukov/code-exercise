const { client, feed } = require('./src');

// Let's do something cool with observable changefeeds!
// Use your imagination
client().then(r => {
 feed(r.table('test'))
  .filter(change => change.type === 'add') //insert')
  .map(change => change.new_val)
  .subscribe(item => {
    console.log('this item was inserted: ', item);
  });

 feed(r.table('test'))
  .filter(change => change.type === 'change') // 'update')
  .map(change => [change.old_val, change.new_val])
  .subscribe(([old_val, new_val]) => {
    console.log('this item was updated: ', old_val, 'with new value: ', new_val);
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
