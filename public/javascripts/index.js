$(document).ready(function(){
    $( ".newGame" ).click(function() {
        $(".welcomeDiv" ).hide();
        $(".enterGameDiv").removeClass("d-none");
    });

    $(".enterGameButton").click(function() {
        var name = $("#name").val();
        Cookies.set('player_name', name);
    });
});

var onPageLoad = function() {
    var name = Cookies.get('player_name');
    if (name != null) {
        //Get state
        $(".welcomeDiv" ).hide();
    }
}