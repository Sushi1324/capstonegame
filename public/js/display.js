var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

var board = [];
var boardsize;
var tilesize = 70;
var graphics;
var socket;

var verts = [];
var edges = [];
var fields = [];

var players = {};
players.graphics = {};
players.graphics.verts = [];



var color = 0xff0000;

function preload ()
{
    this.load.image('trans', "/images/transmitter.png");
}

function create ()
{
    socket = network();
    
    graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x444444 }, fillStyle: {color: 0x00ff00} });
    
    
}


function createBoard(bs) {
    
    boardsize = bs;
    
    var scale = boardsize * tilesize * 2 / config.height;
    
    game.scene.scenes[0].cameras.main.setBounds(-config.width * scale/2, -config.height * scale/2, config.width * scale, config.height * scale, true);
    game.scene.scenes[0].cameras.main.setZoom(1/scale);
    
    
    for (var i = 0; i <= boardsize; i++) {
        board[i] = new Phaser.Geom.Line(-tilesize/2 * (boardsize + i), (tilesize/2 * Math.sqrt(3) * (-i + boardsize)), tilesize/2 * (boardsize+i), (tilesize/2 * Math.sqrt(3) * (-i + boardsize)));
    }
    for (var i = 0; i < boardsize; i++) {
        board[i + boardsize + 1] = new Phaser.Geom.Line(-tilesize/2 * (2 * boardsize - i - 1), (tilesize/2 * Math.sqrt(3) * -(i + 1)), tilesize/2 * (2 * boardsize - i - 1), (tilesize/2 * Math.sqrt(3) * -(i + 1)));
    }
    
    drawBoard();
}

function drawBoard() {
    graphics.lineStyle(2, 0x444444);
    for (var i in board) {
        for (var j = 0; j < 3; j ++) {
            graphics.strokeLineShape(board[i]);
            Phaser.Geom.Line.RotateAroundXY(board[i], 0, 0, Math.PI * 2 /3);
        }
        
    }
    
}

function drawVerts(verts, player) {
    for (var i in verts) {
        var a = verts[i].x;
        var b = verts[i].y;
        
        var temp = toCoords(a, b, board);
        
        var point = new Phaser.Geom.Rectangle(temp.x, temp.y, 16, 16);
        
        players.graphics.verts.push(game.scene.scenes[0].add.image(point.x, point.y-10, "trans"));
        
    }
    
}

function drawEdges(e, player) {
    
    for (var i in e) {
        
        var temp1 = toCoords(players[player].verts[e[i][0]].x, players[player].verts[e[i][0]].y, board);
        var temp2 = toCoords(players[player].verts[e[i][1]].x, players[player].verts[e[i][1]].y, board);
        players[player].edges.push(new Phaser.Geom.Line(temp1.x, temp1.y, temp2.x, temp2.y));
       
        graphics.lineStyle(4, players[player].color);
        graphics.strokeLineShape(players[player].edges[players[player].edges.length-1]);

    }
    
}

function drawFields(f, player) {
    graphics.fillStyle(players[player].color, .25);
    
    for (var i in f) {
        
        var coords = [];
        
        for (var j in f[i]) {
            
            var temp = toCoords(players[player].verts[f[i][j]].x, players[player].verts[f[i][j]].y, board);
            coords.push(temp.x);
            coords.push(temp.y);
            
        }
        
        players[player].fields.push(new Phaser.Geom.Polygon(coords));
        
        
    }
    
    
    players[player].fields.sort(function(a, b) {return Math.abs(a.area)-Math.abs(b.area)});
    
    
    for (var i in players[player].fields) {
        
        
        graphics.fillPoints(players[player].fields[i].points, true);
        
        graphics.lineStyle(10, 0x000000);
        graphics.strokePoints(players[player].fields[i].points, true);        
        graphics.lineStyle(4, players[player].color);
        graphics.strokePoints(players[player].fields[i].points, true);
        
    }
    
    
}


function toCoords(a, b, board) {
    
    if (a > (board.length-1)/2) b -= a-(board.length-1)/2;
    
    return board[board.length - a - 1].getPoint((b)/((board.length-1)/2 + (a > (board.length-1)/2 ? (board.length -1 - a) : a)));
}


