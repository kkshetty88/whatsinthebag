var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://kshetty:wvwCuUFBOuyguqxGckfbFzl0pYr5KF1PCwfEABefzGFzTaUNUPEpkK7udGPFJ7I2n8NMuHW7i3wNMJzZDKOHMA==@kshetty.mongo.cosmos.azure.com:10255/?ssl=true&appName=@kshetty@';
var words = ["Park", "Blood", "Umbrella"];

var insertDocument = function(db, callback) {
    for(i = 0; i < words.length; i++) {
        db.collection('words').insertOne( {
                "id": i,
                "word": words[i]
            }, function(err, result) {
            assert.equal(err, null);
            console.log("Inserted a document into the word collection.");
            callback();
        });
    }
};

var findWords = function(db, callback) {
var cursor =db.collection('words').find( );
cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
        console.dir(doc);
    } else {
        callback();
    }
});
};

// var updateFamilies = function(db, callback) {
// db.collection('families').updateOne(
//     { "lastName" : "Andersen" },
//     {
//         $set: { "pets": [
//             { "givenName": "Fluffy" },
//             { "givenName": "Rocky"}
//         ] },
//         $currentDate: { "lastModified": true }
//     }, function(err, results) {
//     console.log(results);
//     callback();
// });
// };

// var removeFamilies = function(db, callback) {
// db.collection('families').deleteMany(
//     { "lastName": "Andersen" },
//     function(err, results) {
//         console.log(results);
//         callback();
//     }
// );
// };

MongoClient.connect(url, function(err, client) {
assert.equal(null, err);
var db = client.db('wordsDB');
insertDocument(db, function() {
    client.close();
});
});