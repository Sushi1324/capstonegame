var game;
var HUD;

var board = [];
var boardsize;
var graphics;
var socket;

var user = {};

var players = {
    graphics: {
        verts: []
    }
    
};

var loadedImages = [];

var maxZoom;
var moves = [];
var moveList = [];
var xList = [];
var damages = [];
var scores;
var scoreboard = [];
var ready = [];
var turn;
var tempImage = [];
var xpBar;
var energyBar;



var colorInput = document.getElementById("color");
$("#colorview").css({'background-color': 'hsl('+colorInput.value+', 100%, 50%)', border: "black 1px solid", "height": "18px"});
colorInput.oninput = function() {
    $("#colorview").css({'background-color': 'hsl('+colorInput.value+', 100%, 50%)'});
};


