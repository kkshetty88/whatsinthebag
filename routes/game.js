var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://kshetty:wvwCuUFBOuyguqxGckfbFzl0pYr5KF1PCwfEABefzGFzTaUNUPEpkK7udGPFJ7I2n8NMuHW7i3wNMJzZDKOHMA==@kshetty.mongo.cosmos.azure.com:10255/?ssl=true&appName=@kshetty@';
var findWords = function(db, resultWords, callback) {
    var cursor =db.collection('words').find( );
   
    cursor.each(function(err, doc) {
        if (doc != null) {
            console.dir(doc);
            resultWords.push(doc.word);
        } else {
            callback();
        }
    });
};

module.exports = function(app) {  //receiving "app" instance
    app.get('/listWords', function (req, res) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db('wordsDB');
            var resultWords = [];
            findWords(db, resultWords, function() {
                console.log(resultWords);
                res.send(resultWords);
                client.close();
            });
        })
    })
}