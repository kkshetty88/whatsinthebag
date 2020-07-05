var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://kshetty:wvwCuUFBOuyguqxGckfbFzl0pYr5KF1PCwfEABefzGFzTaUNUPEpkK7udGPFJ7I2n8NMuHW7i3wNMJzZDKOHMA==@kshetty.mongo.cosmos.azure.com:10255/?ssl=true&appName=@kshetty@';
var words = [];
const fs = require('fs');
const readline = require('readline');
var shuffleArray = function( array ) {
    var counter = array.length, temp, index;
    // While there are elements in the array
    while ( counter > 0 ) {
        // Pick a random index
        index = Math.floor( Math.random() * counter );

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[ counter ];
        array[ counter ] = array[ index ];
        array[ index ] = temp;
    }
    return array;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream('public/text/words.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`);
    words.push(line);
  }
}

processLineByLine();

var insertDocument = function(db, callback) {
    words = shuffleArray(words);
    var wordSet = new Set(words);
    words = Array.from(wordSet);
    var k = 0;
    for(i = 0; i < words.length; i++) {
        var type = String.fromCharCode(65+k);
        for(j = 0; j < 40; j++) {
            db.collection('words').insertOne( {
                    "id": i,
                    "word": words[i],
                    "type": type
                }, function(err, result) {
                assert.equal(err, null);
                console.log("Inserted a document into the word collection.");
                callback();
            });
            i++;
        }
        k++;
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