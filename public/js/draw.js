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
        if (verts[i] == 0) continue;
        var a = verts[i].x;
        var b = verts[i].y;
        
        var temp = simCoords(a, b, boardsize, config.tilesize);
            
        checkColor(player.color);
        
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
        if (moves[i].type === "trans-") {
            message = "Destroy transmitter located at x: " + moves[i].x + ", y: " + moves[i].y;
        }
        moveList.push(scene.add.text(config.width - 40, config.height - 200 - ((moves.length-i - 1) * 20), message, {color: color, fontSize: 16}).setOrigin(1, 0));
    }
}

function checkColor(color) {
    if (loadedImages.indexOf(color.name) == -1) {
        hueShift("trans", "trans"+color.name, color.hue, game.scene.scenes[0]);
        loadedImages.push(color.name);
    }
}

//Found and adapted from the Phaser example code.
function hueShift (originalTexture, newTexture, shift, scene, dv = 1)
{
    
    originalTexture = scene.textures.get(originalTexture).getSourceImage();

    newTexture = scene.textures.createCanvas(newTexture, originalTexture.width, originalTexture.height);

    context = newTexture.getSourceImage().getContext('2d');

    context.drawImage(originalTexture, 0, 0);
    
    var pixels = context.getImageData(0, 0, originalTexture.width, originalTexture.height);

    for (var i = 0; i < pixels.data.length / 4; i++)
    {
        processPixel(pixels.data, i * 4, shift, dv);
    }

    context.putImageData(pixels, 0, 0);

    newTexture.refresh();
}

function processPixel (data, index, deltahue, dv)
{
    var r = data[index];
    var g = data[index + 1];
    var b = data[index + 2];

    var hsv = Phaser.Display.Color.RGBToHSV(r, g, b);

    var h = hsv.h + deltahue;
    var v = hsv.v * dv;

    var rgb = Phaser.Display.Color.HSVToRGB(h, hsv.s, v);

    data[index] = rgb.r;
    data[index + 1] = rgb.g;
    data[index + 2] = rgb.b;
}


module.exports = {
    createBoard: createBoard,
    drawBoard: drawBoard,
    drawEdges: drawEdges,
    drawFields: drawFields,
    drawVerts: drawVerts,
    updateMoves: updateMoves
};