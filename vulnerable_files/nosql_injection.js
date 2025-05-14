const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017', function(err, client) {
  const db = client.db('test');
  const userInput = req.query.user;
  db.collection('users').find({ name: userInput }).toArray();
});
