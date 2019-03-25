var config = require("./config.js");
var simCoords = require("../../share/coords");


var createBoard = (bs) => {
    
    boardsize = bs;
    
    var scale = boardsize * config.tilesize * 2 / config.height;
    
    console.log(scale);
    
    game.scene.scenes[0].cameras.main.setBounds(-config.width * scale/2, -config.height * scale/2, config.width * scale, config.height * scale, false);
    game.scene.scenes[0].cameras.main.setZoom(0.5);
    
    maxZoom = 1/scale;
    
    
    for (var i = 0; i <= boardsize; i++) {
        board[i] = new Phaser.Geom.Line(
            -config.tilesize/2 * (boardsize + i), 
            (config.tilesize/2 * Math.sqrt(3) * (-i + boardsize)), 
            config.tilesize/2 * (boardsize+i), 
            (config.tilesize/2 * Math.sqrt(3) * (-i + boardsize)));
    }
    
    for (var i = 0; i < boardsize; i++) {
        board[i + boardsize + 1] = new Phaser.Geom.Line(-config.tilesize/2 * (2 * boardsize - i - 1), (config.tilesize/2 * Math.sqrt(3) * -(i + 1)), config.tilesize/2 * (2 * boardsize - i - 1), (config.tilesize/2 * Math.sqrt(3) * -(i + 1)));
    }
    
    return board;
}

var drawBoard = () => {
    graphics.lineStyle(2, 0x444444);
    for (var i in board) {
        for (var j = 0; j < 3; j ++) {
            graphics.strokeLineShape(board[i]);
            Phaser.Geom.Line.RotateAroundXY(board[i], 0, 0, Math.PI * 2 /3);
        }
        
    }
    
}

var drawVerts = (verts, player) => {
    for (var i in verts) {
        var a = verts[i].x;
        var b = verts[i].y;
        
        var temp = simCoords(a, b, boardsize, config.tilesize);


        players.graphics.verts.push(game.scene.scenes[0].add.image(temp.x, temp.y-15, "trans" + player.color.name));
        
    }
    
}

var drawEdges = (e, player) => {
    
    for (var i in e) {
        
        var temp1 = simCoords(player.verts[e[i][0]].x, player.verts[e[i][0]].y, boardsize, config.tilesize);
        var temp2 = simCoords(player.verts[e[i][1]].x, player.verts[e[i][1]].y, boardsize, config.tilesize);
        player.edges.push(new Phaser.Geom.Line(temp1.x, temp1.y, temp2.x, temp2.y));
       
        graphics.lineStyle(4, player.color.num);
        graphics.strokeLineShape(player.edges[player.edges.length-1]);

    }
    
}

var drawFields = (f, player) => {
    graphics.fillStyle(player.color.num, .25);
    
    for (var i in f) {
        
        var coords = [];
        
        for (var j in f[i]) {
            
            var temp = simCoords(player.verts[f[i][j]].x, player.verts[f[i][j]].y, boardsize, config.tilesize);
            coords.push(temp.x);
            coords.push(temp.y);
            
        }
        
        player.fields.push(new Phaser.Geom.Polygon(coords));
        
        
    }
    
    
    player.fields.sort(function(a, b) {return Math.abs(a.area)-Math.abs(b.area)});
    
    
    for (var i in player.fields) {
        
        
        graphics.fillPoints(player.fields[i].points, true);
        graphics.lineStyle(10, 0x000000);
        graphics.strokePoints(player.fields[i].points, true);        
        graphics.lineStyle(4, player.color);
        graphics.strokePoints(player.fields[i].points, true);
        
    }
    
    
    
    
};

var moveList = [];

var updateMoves = function(moves, scene, color) {
    for (var i in moveList) {
        moveList[i].destroy();
    }
    moveList = [];
    for (var i = moves.length-1; i >= 0; i --) {
        var message = "";
        if (moves[i].type === "trans+") {
            message = "Transmitter placed at x: " + moves[i].x + ", y: " + moves[i].y;
        }
        if (moves[i].type === "link+") {
            message = "Link formed between " + moves[i].a + " and " + moves[i].b;
        }
        moveList.push(scene.add.text(config.width - 40, config.height - 200 - ((moves.length-i - 1) * 20), message, {color: color, fontSize: 16}).setOrigin(1, 0));
    }
}

module.exports = {
    createBoard: createBoard,
    drawBoard: drawBoard,
    drawEdges: drawEdges,
    drawFields: drawFields,
    drawVerts: drawVerts,
    updateMoves: updateMoves
};