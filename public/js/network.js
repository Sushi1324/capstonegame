var createBoard = require("./draw").createBoard;
var drawBoard = require("./draw").drawBoard;
var drawVerts = require("./draw").drawVerts;
var drawFields = require("./draw").drawFields;
var drawEdges = require("./draw").drawEdges;
var updateMoves = require("./draw").updateMoves;

var simCoords = require("../../share/coords");
var config = require("./config");

function network() {
    

    var socket = io().connect();
    
    socket.on("invalid", function() {
        alert("Invalid Room");
        window.location = "/";
    });
    
    
    socket.on("init", function(data) {
        var room = window.location.pathname.slice(6);
        var pos = room.indexOf('/');
        if (pos != -1) room = room.slice(pos);
        
        $("#join").modal();
        $("#join-submit").click(function() {
            socket.emit('join', room, $("#name").val(), $("#color").val());
        });
        
    });
    
    socket.on("test", function(data) {
        console.log(data);
        
    });
    
    socket.on("user data", function(data) {
        user = data;
    });
    
    socket.on("init game", function(data) {
        
        $("#join").modal("hide");
        
        createBoard(data.boardsize);
        var startPoint = simCoords(data.base.x, data.base.y, boardsize, config.tilesize);
        game.scene.scenes[0].cameras.main.centerOn(startPoint.x, startPoint.y);
        HUD = game.scene.scenes[1];
        
        var button = HUD.add.sprite(config.width - 100, config.height - 100, "button").setInteractive();
        button.on("pointerdown", function() {
            socket.emit("turn", moves);
            
            
        });
        
        
        scoreboard[0] = HUD.add.text(45, 50, "Scoreboard", {color: "#AAAAAA", align: "center", fontSize: 24});
        
        var controls = HUD.add.text(50, config.height - 100, "Press \"T\" to create a new Transmitter\nPress \"L\" to form a new link between existing transmitters", {color: user.color.hex, fontsize: 24});
        
        turn = HUD.add.text(config.width-150, config.height - 50, "Turn: 0", {color:"#AAAAAA", fontSize: 24, align: "center"});
        controls.setStroke("#444444", 2);
        
    });
    
    socket.on("update", function(game) {
        
        console.log(game);
        
        update(game);

        
    });
    
    
    socket.on("end turn", function(g) {
        update(g);
        
        moves = [];
        updateMoves(moves, game.scene.scenes[1]);
        for (var i in tempImage) {
            tempImage[i].destroy();
        }
        tempImage = [];
    });
    
    socket.on("download", (game) => { 
        downloadObjectAsFile(game, "game.sog");
    });
    
    socket.on("user taken", () => {
        alert("Name already taken");
        //setTimeout(()=>{location.reload();}, 3000);
    });
    
    
    return socket;
}

module.exports = network;


function update(game) {
    
    
    for (var i in players.graphics.verts) {
        players.graphics.verts[i].destroy();
    }
    
    
    
    graphics.clear();
    
    drawBoard();
    
    players = {
        
        graphics: {
            verts: [],
            
        },

    };
    
    var scores = [];
    
    for (var i in game.players) {
        
        players[i] = {};
        players[i].verts = game.players[i].verts;
        players[i].edges = [];
        players[i].fields = [];
        players[i].color = game.players[i].color;


        scores.push({name: game.players[i].name, color: game.players[i].color.hex, score: game.players[i].score});
        
        drawVerts(game.players[i].verts, players[i]);
        drawFields(game.players[i].fields, players[i]);
        drawEdges(game.players[i].edges, players[i]);

    }
    
    scores.sort(function(a, b) {
       return (b.score - a.score); 
    });
    
    
    for (var i in scores) {
        if (!scoreboard[i+1]) scoreboard[i+1] = HUD.add.text(50, 74 + i*24, "Temp", {fontSize: 16, align: "center", color: "#FFFFFF"});
        scoreboard[i + 1].setText(scores[i].name + ": " + scores[i].score);
        scoreboard[i+1].setColor(scores[i].color);
        scoreboard[i+1].setStroke("#444444", 2);
        if (scoreboard[i+2]) scoreboard[i+2].setColor("#000000");
    }
    
    turn.setText("Turn: " + game.turn);
}


//https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
function downloadObjectAsFile(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportObj);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
}
