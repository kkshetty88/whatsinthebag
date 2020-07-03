window.onload = function () {
    const WORD_URL = "/listWords";
    const GAME_URL = "/games";
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
    var postRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      };
    var app = new Vue({
        el: '#app',
        data: {
            isWelcomeHidden: true,
            isStartGameHidden: true,
            isJoinGameHidden: true,
            isGameInProgress: false,
            playerName: '',
            gameId: null,
            gameDescription: '',
            showWords: false,
            wordsPassed: [],
            wordsGuessed: [],
            wordsLeft: [],
            currentWord: '',
            showPass: true,
            score: { 'A': 0, 'B': 0},
            round: 1,
            currentTeam: 'A',
            showScores: false
        },
        mounted: function(){
            this.refreshPage()
        },
        methods: {
            startNew: function (event) {
                this.isWelcomeHidden = true;
                this.isStartGameHidden = false;
            },
            joinGame: function(event) {
                this.isWelcomeHidden = true;
                this.isJoinGameHidden = false;
            },
            enterGame: function(event) {
                Cookies.set('player_name', this.playerName);
                this.isWelcomeHidden = true;
                this.isStartGameHidden = true;
                this.isGameInProgress = true;
                fetch(WORD_URL)
                    .then(response => response.json())
                    .then(result => {
                        this.wordsLeft = result;
                        console.log(this.wordsLeft);
                        postRequestOptions.body = JSON.stringify({
                            words_left: result,
                            words_guessed: [],
                            words_passed: [],
                            round: 1,
                            score: this.score,
                            currentTeam: this.currentTeam
                        })
                        fetch(GAME_URL, postRequestOptions)
                            .then(response => response.json())
                            .then(data => {
                                this.gameId = data.id;
                                this.gameDescription = 'Game '+this.gameId+' in progress. Please let others know';
                                Cookies.set('game_id', this.gameId);
                            });
                    });
            },
            enterGameGuest: function(event) {
                Cookies.set('player_name', this.playerName);
                Cookies.set('game_id', this.gameId);
                this.isWelcomeHidden = true;
                this.isStartGameHidden = true;
                this.isGameInProgress = true;
                this.isJoinGameHidden = true;
                fetch(GAME_URL+'/'+this.gameId)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                        this.wordsLeft = result.words_left;
                        this.score = result.score;
                        this.currentTeam = result.currentTeam;
                    });
            },
            refreshPage: function(event) {
                var playerName = Cookies.get('player_name');
                if(playerName != null) {
                    this.gameId = Cookies.get('game_id');
                    this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                    this.isWelcomeHidden = true;
                    this.isGameInProgress = true;
                } else {
                    this.isWelcomeHidden = false;
                    this.isGameInProgress = false;
                }
            },
            clearCookies: function(event) {
                Cookies.remove('player_name');
                Cookies.remove('game_id');
                this.refreshPage();
            },
            beginGame: function(event) {
                fetch(GAME_URL+'/'+this.gameId)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                        this.wordsLeft = result.words_left;
                        this.currentWord = this.wordsLeft.pop();
                        this.score = result.score;
                        this.currentTeam = result.currentTeam;
                    });
                this.isGameInProgress = false;
                this.showWords = true;
            },
            resumeGame: function(event) {
                this.wordsLeft = this.wordsLeft.concat(this.wordsPassed);
                if (this.wordsLeft.length == 0) {
                    alert("End of round");
                    this.round++;
                    return;
                }
                this.showWords = true;
                this.wordsLeft = shuffleArray(this.wordsLeft);
                this.currentWord = this.wordsLeft.pop();
            },
            pass: function(event) {
                this.wordsPassed.push(this.currentWord);
                if (this.wordsLeft.length == 0) {
                    alert("End of round");
                    this.round++;
                    this.toggleTeam();
                    return;
                }
                this.currentWord = this.wordsLeft.pop();
                this.showPass = false;
            },
            correct: function(event) {
                this.wordsGuessed.push(this.currentWord);
                if (this.wordsLeft.length == 0) {
                    alert("End of round");
                    this.round++;
                    return;
                }
                this.currentWord = this.wordsLeft.pop();
                this.score[this.currentTeam]++;
            },
            endTurn: function(event) {
                this.toggleTeam();
                this.resumeGame();
                this.showScores = true;
                this.showWords = false;
                console.log(this.wordsLeft);
                console.log(this.wordsPassed);
                this.wordsLeft = this.wordsLeft.concat(this.wordsPassed);
                this.wordsLeft = shuffleArray(this.wordsLeft);
                postRequestOptions.body = JSON.stringify({
                    words_left: this.wordsLeft,
                    words_guessed: [],
                    words_passed: [],
                    round: 1,
                    id: this.gameId,
                    score: this.score,
                    currentTeam: this.currentTeam
                })
                fetch(GAME_URL, postRequestOptions)
                    .then(response => response.json())
                    .then(data => {
                        this.gameId = data.id;
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                    });
            },
            toggleTeam: function(event) {
                if (this.currentTeam === 'A') {
                    this.currentTeam = 'B';
                } else {
                    this.currentTeam = 'A';
                }
            }
          }
    })
}   