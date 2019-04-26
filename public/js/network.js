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
    
    socket.on("invalid", function(m) {
        alert(m);
        window.location = "/";
    });
    
    
    socket.on("init", function(data) {
        var room = window.location.pathname.slice(6);
        var pos = room.indexOf('/');
        if (pos != -1) room = room.slice(pos);
        
        $("#join").modal();
        $("#color").val(Math.floor(Math.random() * 360));
        $("#colorview").css({'background-color': 'hsl('+$("#color").val()+', 100%, 50%)'});
        $("#join-submit").click(function() {
            socket.emit('join', room, $("#name").val(), $("#color").val());
        });
        
        $("#download").click(function() {
           socket.emit('download'); 
        });
        
        $("#leave").click(function() {
            socket.emit('leave');
            window.location = "/";
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
        
        var info = HUD.add.rectangle(config.width - 50, 10, 64, 32, 0x000000).setStrokeStyle(2, 0xFFFF00);
        var infoText = HUD.add.text(config.width-50, 12, "Info", {color:"#FFFF00", fontSize: 16}).setInteractive().setOrigin(.5,.5);
        
        infoText.on("pointerdown", function() {
            $("#info").modal();
        });
        
        
        scoreboard[0] = HUD.add.text(45, 50, "Scoreboard", {color: "#AAAAAA", align: "center", fontSize: 24});
        
        //var controls = HUD.add.text(50, config.height - 100, "Press \'T\' to create a new Transmitter\nPress \'L\' to form a new link between existing transmitters\nPress \'D\' to delete a transmitter", {color: user.color.hex, fontsize: 24});
        
        turn = HUD.add.text(config.width-150, config.height - 50, "Turn: 0", {color:"#AAAAAA", fontSize: 24, align: "center"});
        //controls.setStroke("#444444", 2);
        
        xpBar = [HUD.add.rectangle(config.width/2, 30, 400, 20, 0x666666),
                HUD.add.rectangle(config.width/2-197, 30, 30, 15, user.color.num),
                HUD.add.text(config.width/2, 30, "0/1024xp", {color:"#222222", fontSize: 18, align: "center"})
            ];
        xpBar[1].setOrigin(0, .5);
        xpBar[2].setOrigin(.5, .5);
        
        energyBar = [HUD.add.sprite(50, config.height - 50, "energy"),
                    HUD.add.rectangle(200, config.height-50, 192, 20, 0x7aff7b),
                    HUD.add.text(200, config.height-50, "0/512 Energy", {color:"#222222", fontSize: 16})];
        energyBar[2].setOrigin(.5, .5).setStroke("#222222", 1.5);
        
        
    });
    
    socket.on("ready", function(notReady) {
        for (var i in scores) {
            if (notReady.indexOf(scores[i].name) == -1) {
                ready.push(HUD.add.sprite(40, 74 + i*24, "check").setOrigin(.5, 0).setScale(.25));
            }
        }
        
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
        for (var i in ready) {
            ready[i].destroy();
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
    for (var i in damages) {
        damages[i].destroy();
    }
    damages = [];
    
    
    
    graphics.clear();
    
    drawBoard();
    
    players = {
        
        graphics: {
            verts: [],
            
        },

    };
    
    scores = [];
    
    
    console.log(game.players);
    
    for (var i in game.players) {
        
        
        players[i] = {};
        players[i].verts = game.players[i].verts;
        players[i].edges = [];
        players[i].fields = [];
        players[i].color = game.players[i].color;
        players[i].level = game.players[i].level;


        scores.push({name: game.players[i].name, color: game.players[i].color.hex, score: game.players[i].score});
        
        drawVerts(game.players[i].verts, players[i]);
        drawFields(game.players[i].fields, players[i]);
        drawEdges(game.players[i].edges, players[i]);

    }
    
    for (var n in scoreboard) {
        scoreboard[n].destroy();
    }
    scoreboard = [HUD.add.text(45, 50, "Scoreboard", {color: "#AAAAAA", align: "center", fontSize: 24})];
    
    scores.sort(function(a, b) {
       return (b.score - a.score);
    });
    
    xpBar[1].width = 394*(game.players[user.id].xp-(Math.floor(Math.pow(2, game.players[user.id].level-2))*1024))/Math.ceil(Math.pow(2, game.players[user.id].level-2))/1024;
    
    xpBar[2].setText("Level " + game.players[user.id].level + ": " + game.players[user.id].xp + "/" + Math.pow(2, game.players[user.id].level-1)*1024 + "xp");
    
    energyBar[2].setText("Energy: " + game.players[user.id].energy + "/" + Math.pow(2, game.players[user.id].level-1)*256);
    
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
