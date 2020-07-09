window.onload = function () {
    const WORD_URL = "/listWords";
    const GAME_URL = "/games";
    var startTimer = function(duration, display, endFunction, changeColor) {
        var timer = duration, minutes, seconds;
        return setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
    
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
    
            display.message = minutes + ":" + seconds;
            timer--;
            if (timer < 10) {
                changeColor(null, true);
            }
            if (timer == 0) {
                changeColor(null, false);
                endFunction(null, true);
            }
        }, 1000);
    }
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
    var initialState = function(){
        return {
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
            finalScore: { 'A': 0, 'B': 0},
            round: 1,
            currentTeam: 'A',
            showScores: false,
            players: [],
            teamPlayers: {'A': [], 'B': []},
            showCreateTeams: false,
            isAdmin: false,
            isLoading: false,
            timeLeft: {message: ''},
            timerHandle: null,
            isGameEnded: false,
            winner: '',
            selected: {},
            timesUp: false,
            isTimeEnding: false,
            allWords: []
        }
    };
    var app = new Vue({
        el: '#app',
        data: function() {
            return initialState();
        },
        mounted: function(){
            this.refreshPage();
        },
        beforeDestroy: function() {
            clearInterval(this.polling);
        },
        methods: {
            loadData: function() {
                if (this.gameId != null) {
                    fetch(GAME_URL+'/'+this.gameId)
                        .then(response => response.json())
                        .then(result => {
                            this.finalScore = result.score;
                            this.round = result.round;
                            this.teamPlayers = result.teamPlayers;
                            this.currentTeam = result.currentTeam;
                            this.allWords = result.all_words;
                            if (result.round >= 4) {
                                this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                                this.wordsLeft = result.words_left;
                                this.currentWord = this.wordsLeft.pop();
                                this.score = result.score;
                                this.endTurn();
                            }
                        });
                }
            },
            startNew: function (event) {
                this.isWelcomeHidden = true;
                this.isStartGameHidden = false;
                this.polling = setInterval(function () {
                    this.loadData();
                  }.bind(this), 2000);
            },
            joinGame: function(event) {
                this.isWelcomeHidden = true;
                this.isJoinGameHidden = false;
                this.polling = setInterval(function () {
                    this.loadData();
                  }.bind(this), 2000);
            },
            submitTeams: function(event) {
                Object.keys(this.selected).forEach(key => {
                    console.log(this.selected[key]);
                    if(this.selected[key] === 'B') {
                        this.teamPlayers['B'].push(key);
                    } else {
                        this.teamPlayers['A'].push(key);
                    }
                });
                console.log("SHETTY");
                console.log(this.teamPlayers);
                this.isLoading = true;
                postRequestOptions.body = JSON.stringify({
                    words_left: this.wordsLeft,
                    words_guessed: [],
                    words_passed: [],
                    round: this.round,
                    score: this.score,
                    currentTeam: this.currentTeam,
                    players: [this.playerName],
                    teamPlayers: this.teamPlayers,
                    id: this.gameId,
                    all_words: this.allWords
                })
                fetch(GAME_URL, postRequestOptions)
                    .then(response => response.json())
                    .then(data => {
                        this.gameId = data.id;
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please let others know';
                        Cookies.set('game_id', this.gameId);
                        this.isLoading = false;
                    });
            },
            enterGame: function(event) {
                if (!this.playerName) {
                    alert('Name is required');
                    return;
                }
                this.isLoading = true;
                Cookies.set('player_name', this.playerName);
                this.isWelcomeHidden = true;
                this.isStartGameHidden = true;
                this.isGameInProgress = true;
                this.isAdmin = true;
                fetch(WORD_URL)
                    .then(response => response.json())
                    .then(result => {
                        this.wordsLeft = result;
                        this.allWords = result;
                        Cookies.set('words', result);
                        console.log(this.wordsLeft);
                        postRequestOptions.body = JSON.stringify({
                            words_left: result,
                            words_guessed: [],
                            words_passed: [],
                            round: this.round,
                            score: this.score,
                            currentTeam: this.currentTeam,
                            players: [this.playerName],
                            teamPlayers: this.teamPlayers,
                            all_words: this.allWords
                        })
                        fetch(GAME_URL, postRequestOptions)
                            .then(response => response.json())
                            .then(data => {
                                this.gameId = data.id;
                                this.gameDescription = 'Game '+this.gameId+' in progress. Please let others know';
                                Cookies.set('game_id', this.gameId);
                                this.isLoading = false;
                            });
                    });
            },
            enterGameGuest: function(event) {
                this.isLoading = true;
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
                        this.teamPlayers = result.teamPlayers;
                        this.allWords = result.all_words;
                        Cookies.set('words', this.wordsLeft);
                        postRequestOptions.body = JSON.stringify({
                            id: this.gameId,
                            players: result.players.concat(this.playerName),
                            words_left: this.wordsLeft,
                            words_guessed: [],
                            words_passed: [],
                            round: result.round,
                            score: this.score,
                            currentTeam: this.currentTeam,
                            teamPlayers: this.teamPlayers,
                            all_words: this.allWords
                        })
                        fetch(GAME_URL, postRequestOptions)
                            .then(response => response.json())
                            .then(data => {
                                this.isLoading = false;
                            });
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
                    this.showCreateTeams = false;
                    this.showScores = false;
                    this.teamPlayers =  {'A': [], 'B': []};
                    this.players = [];
                }
            },
            clearCookies: function(event) {
                Cookies.remove('player_name');
                Cookies.remove('game_id');
                Cookies.remove('words');
                clearInterval(this.polling);
                Object.assign(this.$data, initialState());
                this.refreshPage();
            },
            switchNextTurn: function(event) {
                this.toggleTeam();
                this.isLoading = true;
                postRequestOptions.body = JSON.stringify({
                    words_left: this.wordsLeft,
                    words_guessed: [],
                    words_passed: [],
                    round: this.round,
                    id: this.gameId,
                    score: this.score,
                    currentTeam: this.currentTeam,
                    teamPlayers: this.teamPlayers,
                    all_words: this.allWords
                })
                fetch(GAME_URL, postRequestOptions)
                    .then(response => response.json())
                    .then(data => {
                        this.gameId = data.id;
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                        this.isLoading = false;
                        this.timesUp = false;
                    });
            },
            createTeams: function(event) {
                this.isLoading = true;
                this.isGameInProgress = false;
                this.showCreateTeams = true;
                fetch(GAME_URL+'/'+this.gameId)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                        this.players = result.players;
                        this.isLoading = false;
                    });
            },
            beginGame: function(event) {
                console.log(this.selected[this.playerName]);
                this.isLoading = true;
                fetch(GAME_URL+'/'+this.gameId)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                        this.wordsLeft = result.words_left;
                        this.currentWord = this.wordsLeft.pop();
                        this.score = result.score;
                        this.currentTeam = result.currentTeam;
                        this.round = result.round;
                        this.teamPlayers = result.teamPlayers;
                        this.allWords = result.all_words;
                        console.log(this.teamPlayers);
                        if (this.round >= 4) {
                            this.endTurn();
                        }
                        this.isLoading = false;
                    });
                this.isGameInProgress = false;
                this.showWords = true;
                this.showScores = false;
                this.showCreateTeams = false;
                this.timerHandle = startTimer(60, this.timeLeft, this.endTurn, this.changeColor);
            },
            changeColor: function(event, value) {
                this.isTimeEnding = value;
            },
            pass: function(event) {
                this.wordsPassed.push(this.currentWord);
                if (this.wordsLeft.length == 0) {
                    this.endTurn();
                    return;
                }
                this.currentWord = this.wordsLeft.pop();
                this.showPass = false;
            },
            correct: function(event) {
                this.wordsGuessed.push(this.currentWord);
                if (this.wordsLeft.length == 0 && this.wordsPassed.length != 0) {
                    this.score[this.currentTeam]++;
                    this.currentWord = null;
                    this.showPass = true;
                    this.endTurn();
                    return;
                }
                else if (this.wordsLeft.length == 0) {
                    alert("End of round "+ this.round);
                    this.round++;
                    this.wordsLeft = this.allWords;
                    this.currentWord = null;
                    this.showPass = true;
                    this.score[this.currentTeam]++;
                    this.endTurn();
                    return;
                }
                this.currentWord = this.wordsLeft.pop();
                this.score[this.currentTeam]++;
            },
            endTurn: function(event, timesUp = false) {
                console.log(timesUp);
                this.isLoading = true;
                this.timesUp = timesUp;
                this.toggleTeam();
                clearInterval(this.timerHandle);
                this.showScores = true;
                this.showPass = true;
                this.showWords = false;
                console.log(this.wordsLeft);
                console.log(this.wordsPassed);
                this.wordsLeft = this.wordsLeft.concat(this.wordsPassed);
                this.wordsPassed = [];
                if (this.currentWord != null) {
                    this.wordsLeft.push(this.currentWord);
                }
                this.wordsLeft = shuffleArray(this.wordsLeft);
                postRequestOptions.body = JSON.stringify({
                    words_left: this.wordsLeft,
                    words_guessed: [],
                    words_passed: [],
                    round: this.round,
                    id: this.gameId,
                    score: this.score,
                    currentTeam: this.currentTeam,
                    teamPlayers: this.teamPlayers,
                    all_words: this.allWords
                })
                fetch(GAME_URL, postRequestOptions)
                    .then(response => response.json())
                    .then(data => {
                        this.gameId = data.id;
                        this.gameDescription = 'Game '+this.gameId+' in progress. Please wait for your turn';
                        setTimeout(function() {
                            this.isLoading = false;
                            this.timesUp = false;
                        }.bind(this), 1000); 
                    });
                if (this.round >= 4) {
                    this.isGameEnded = true;
                    this.finalScore = this.score;
                    clearInterval(this.polling);
                    if (this.score['A'] > this.score['B']) {
                        this.winner = 'A';
                    } else {
                        this.winner = 'B';
                    }
                }
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