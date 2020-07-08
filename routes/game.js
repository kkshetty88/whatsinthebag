var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://kshetty:wvwCuUFBOuyguqxGckfbFzl0pYr5KF1PCwfEABefzGFzTaUNUPEpkK7udGPFJ7I2n8NMuHW7i3wNMJzZDKOHMA==@kshetty.mongo.cosmos.azure.com:10255/?ssl=true&appName=@kshetty@';
var findWords = function(db, resultWords, callback) {
    var randomNum = Math.floor(Math.random() * 6);
    var type = String.fromCharCode(65+randomNum);
    var cursor =db.collection('words').find({"type": type});
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
        });
    })

    app.get('/games/:id', function (req, res) {
        console.log("Here");
        const gameId = Number(req.params.id);
        MongoClient.connect(url, function(err, client) {
            var db = client.db('gamesDB');
            var games = db.collection('games').find({"id": gameId});
            games.each(function(err, doc) {
                if (doc != null) {
                    res.send(doc);
                }
            });
            client.close();
        });
    })

    app.post('/games', function (req, res) {
        const body = req.body;
        console.log(body);
        MongoClient.connect(url, function(err, client) {
            if('id' in body) {
                var gameId = Number(body.id);
            } else {
                var gameId = Math.floor((Math.random() * 1000) + 1);
            }
            var db = client.db('gamesDB');
            db.collection('games').updateOne( {"id": gameId}, { $set: {
                    "id": gameId,
                    "words_guessed": body.words_guessed,
                    "words_passed": body.words_passed,
                    "words_left": body.words_left,
                    "round": body.round,
                    "score": body.score,
                    "currentTeam": body.currentTeam,
                    "players": body.players,
                    "round": body.round,
                    "teamPlayers": body.teamPlayers
                }},
                {
                    upsert: true
                },
                function(err, result) {
                    console.log(result);
                    console.log(err);
                    console.log("Inserted a document into the games collection.");
                    client.close();
                    res.send({id: gameId});
                }
            );
        });
    })
}