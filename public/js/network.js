function network() {

    var createBoard = require("./draw").createBoard;
    var drawBoard = require("./draw").drawBoard;
    var drawVerts = require("./draw").drawVerts;
    var drawFields = require("./draw").drawFields;
    var drawEdges = require("./draw").drawEdges;
    var updateMoves = require("./draw").updateMoves;
    
    var simCoords = require("../../share/coords");
    var config = require("./config");
    

    var socket = io().connect();
    
    
    socket.on("init", function(data) {
        socket.emit('join', "1234", "Player");
    });
    
    socket.on("test", function(data) {
        console.log(data);
        
    });
    
    socket.on("user data", function(data) {
        user = data;
    });
    
    socket.on("init game", function(data) {
        console.log(data);
        createBoard(data.boardsize);
        var startPoint = simCoords(data.base.x, data.base.y, boardsize, config.tilesize);
        game.scene.scenes[0].cameras.main.centerOn(startPoint.x, startPoint.y);
        HUD = game.scene.scenes[1];
        
        var button = HUD.add.sprite(config.width - 100, config.height - 100, "button").setInteractive();
        button.on("pointerdown", function() {
            socket.emit("turn", moves);
            moves = [];
            updateMoves(moves, game.scene.scenes[1]);
            for (var i in tempImage) {
                tempImage[i].destroy();
            }
            tempImage = [];
        });
        
        
        scoreboard[0] = HUD.add.text(50, 50, "Scoreboard", {color: "#AAAAAA", align: "center", fontSize: 24});
        
    });
    
    socket.on("update", function(game) {
        
        
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
        
        console.log(scores);
        
        for (var i in scores) {
            if (!scoreboard[i+1]) scoreboard[i+1] = HUD.add.text(50, 74 + i*24, "Temp", {fontSize: 16, align: "center", color: "#FFFFFF"});
            scoreboard[i + 1].setText(scores[i].name + ": " + scores[i].score);
            scoreboard[i+1].setColor(scores[i].color);
        }
        
        
        
    });
    
    return socket;
}

module.exports = network;
