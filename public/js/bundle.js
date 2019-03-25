(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {

    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    tilesize: 70,
    colors: [0xFFFF00,0x808000,0x00FF00,0x008000,0x00FFFF,0x008080,0x0000FF,0x000080,0xFF00FF,0x800080]

};
},{}],2:[function(require,module,exports){
var config = require("./config");
var updateMoves = require("./draw").updateMoves;


// {
//     preload: preload,
//     create: create
// };

class Board extends Phaser.Scene {
    constructor() {
        super({key: "Board", active: true});
    }
    preload() {
        this.load.image('trans', "/images/transmitter.png");
        
        
        
        
        
    }
    create() {
        var simCoords = require('../../share/coords');
        
        initColors("trans", this);
        
        var scale = 1/maxZoom;
        var ZOOMSPEED = .8;
        
        var mouseAction = "none";
        var linkTo = -1;

        
        graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x444444 }, fillStyle: {color: 0x00ff00} });
        
        socket = Network();
        
        
        this.input.keyboard.on('keydown_MINUS', function (event) {
    
            
            var cam = this.scene.cameras.main;
            scale = 1/cam.zoom;
            var mouse = mousePos(cam, scale);
            
            if (cam.zoom*ZOOMSPEED > maxZoom) {
                var newCam  = invMouse(mouse.x, mouse.y, scale/ZOOMSPEED);
                cam.zoomTo(cam.zoom * ZOOMSPEED, 300);
                cam.pan((newCam.x + config.width/2), (newCam.y + config.height/2), 300);
                
            }
            else {
                cam.zoomTo(maxZoom, 300);
            }
    
        });
        
        this.input.keyboard.on('keydown_PLUS', function (event) {
            
            var cam = this.scene.cameras.main;
            
            scale = 1/cam.zoom;
            var mouse = mousePos(cam, scale);
    
            if (cam.zoom < 1) {
                
                var newCam  = invMouse(mouse.x, mouse.y, scale*ZOOMSPEED);
                
                cam.zoomTo(cam.zoom / ZOOMSPEED, 300);
                cam.pan((newCam.x + config.width/2), (newCam.y + config.height/2), 300);
    
            }
    
        });
        
        this.input.keyboard.on('keydown_T', function (event) {
            
            if (mouseAction == "L") {
                tempImage[tempImage.length - 1].destroy();
            }
            if (mouseAction != "T") {
                var mouse = mousePosGrid(game.scene.scenes[0].cameras.main, 1/game.scene.scenes[0].cameras.main.zoom, boardsize, config.tilesize);
                mouse = simCoords(mouse.a, mouse.b, boardsize, config.tilesize);
            
                tempImage.push(game.scene.scenes[0].add.image(mouse.x, mouse.y-15, "trans" + user.color.name).setAlpha(.5));
            }
            
            
            mouseAction = "T";
        });
        
        this.input.keyboard.on('keydown_L', function (event) {
           
           if (mouseAction == "T") {
                tempImage[tempImage.length - 1].destroy();
            }
           
           mouseAction = "L";
           linkTo = -1;
           
            
        });
        
        this.input.on('pointerdown', function (pointer) {
          
            var mouse = mousePosGrid(game.scene.scenes[0].cameras.main, 1/game.scene.scenes[0].cameras.main.zoom, boardsize, config.tilesize);
    
    
            if (mouseAction === "T") {
                moves.push({type: "trans+", x:mouse.a, y:mouse.b});
                mouseAction = "none";
                
            }
            
            if (mouseAction === "L") {
                for (var v in players[user.id].verts) {
                    var vert = players[user.id].verts[v];
                    if (vert.x == mouse.a && vert.y == mouse.b) {
                        if (linkTo != -1) {
                            moves.push({type: "link+", a: linkTo, b:vert.id});
                            
                            linkTo = -1;
                            mouseAction = "none";
                            
                        }
                        else {
                            var temp = simCoords(mouse.a, mouse.b, boardsize, config.tilesize);
                            tempImage.push(game.scene.scenes[0].add.line(0, 0, temp.x, temp.y, temp.x, temp.y, user.color.num, 0.5));
                            tempImage[tempImage.length-1].setLineWidth(4);
                            linkTo = vert.id;
                        }
                    
                    }
                }
                
            }
            

            
            updateMoves(moves, game.scene.scenes[1], user.color.hex);
            
    
        }, this);
        
        this.input.on('pointermove', function (pointer) {
            if (mouseAction === "T") {
                var mouse = mousePosGrid(game.scene.scenes[0].cameras.main, 1/game.scene.scenes[0].cameras.main.zoom, boardsize, config.tilesize);
                
                var mouse = simCoords(mouse.a, mouse.b, boardsize, config.tilesize);
                tempImage[tempImage.length-1].setPosition(mouse.x, mouse.y-15)
            }
            
            if (mouseAction === "L" && linkTo != -1) {
                
                var mouse = mousePosGrid(game.scene.scenes[0].cameras.main, 1/game.scene.scenes[0].cameras.main.zoom, boardsize, config.tilesize);
                var mouse = simCoords(mouse.a, mouse.b, boardsize, config.tilesize);
                
                tempImage[tempImage.length-1].setDisplayOrigin(0, 0);
                tempImage[tempImage.length-1].setTo(mouse.x, mouse.y, tempImage[tempImage.length-1].geom.x2, tempImage[tempImage.length-1].geom.y2);
                
            }
        });
        
    
            
            
    }
}

class HUD extends Phaser.Scene {
    constructor() {
        super({key: "HUD", active: true});
    }
    preload() {
        this.load.image('button', "/images/button.png");
    }
    create() {
        
        
    }
}

config.scene = [Board, HUD];

var Transmitter = require("../../share/transmitter");
var Network = require("./network");

game = new Phaser.Game(config);

HUD = game.scene.scenes[1];

function mousePos(cam, scale) {
    var x = (cam.scrollX+config.width/2) + (game.input.mousePointer.x-config.width/2) * scale;
    var y = (cam.scrollY+config.height/2) + (game.input.mousePointer.y-config.height/2) * scale;
    
    
    return {x: x, y: y};
}

function mousePosGrid(cam, scale, size, tile) {
    var pos = mousePos(cam, scale);
    var x = pos.x;
    var y = pos.y;
    
    var out = {};
    
    out.a = Math.round(2 * y / (tile*Math.sqrt(3)) + size);
    out.b = Math.round(x/tile + (out.a-size)/2 + size);
    
    return out;
    
}


function invMouse(x, y, scale) {
    
    var scrollX = x - (game.input.mousePointer.x-config.width/2) * scale - config.width/2;
    var scrollY = y - (game.input.mousePointer.y-config.height/2) * scale - config.height/2;
    
    return {x: scrollX, y: scrollY};
    
}


function initColors(originalTexture, scene) {
    
    
    hueShift(originalTexture, originalTexture + "Red", 0, scene);
    hueShift(originalTexture, originalTexture + "Yellow", .166666, scene);
    hueShift(originalTexture, originalTexture + "Green", .3333, scene);
    hueShift(originalTexture, originalTexture + "Cyan", .5, scene);
    hueShift(originalTexture, originalTexture + "Blue", .66666, scene);
    hueShift(originalTexture, originalTexture + "Magenta", .833333, scene);
    
    
    hueShift(originalTexture, originalTexture + "Red2", 0, scene, .5);
    hueShift(originalTexture, originalTexture + "Yellow2", .166666, scene, .5);
    hueShift(originalTexture, originalTexture + "Green2", .3333, scene, .5);
    hueShift(originalTexture, originalTexture + "Cyan2", .5, scene, .5);
    hueShift(originalTexture, originalTexture + "Blue2", .66666, scene, .5);
    hueShift(originalTexture, originalTexture + "Magenta2", .833333, scene, .5);
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


},{"../../share/coords":5,"../../share/transmitter":6,"./config":1,"./draw":3,"./network":4}],3:[function(require,module,exports){
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
},{"../../share/coords":5,"./config.js":1}],4:[function(require,module,exports){
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

},{"../../share/coords":5,"./config":1,"./draw":3}],5:[function(require,module,exports){
function simCoords(a, b, size, tile = 100) {
    
    var out = {};
    out.y = (a-size) * tile/2 * Math.sqrt(3);
    out.x = (b-size)*tile + -(a-size)*tile/2;
    
    return out;
}

module.exports = simCoords;
},{}],6:[function(require,module,exports){
var Transmitter = function(x, y, id) {
    
    this.x = x;
    this.y = y;
    this.id = id;
    
    this.active = true;
    this.visited = false;
    
    this.health = 100;
    this.level = 1;
    
    this.links = [];
    
    this.addLink = function(n) {
        
        this.links.push(n.id);
        n.links.push(this.id);
    };
    
    this.dfs = function(verts, path, cycles) {
        if (path.length == 3) return [];
        this.visited = true;
        path.push(this.id);
        for (var x in this.links) {
            var n = verts[this.links[x]].id;
            if (path.length == 1 || path[path.length-2] != n) {
                if (verts[n].visited) {
                    
                    cycles.push(path.slice(path.indexOf(n), path.length));
                }
                else {
                    cycles = cycles.concat(verts[n].dfs(verts, path, []));
                }
            }
            
        }
        path.pop();
        this.visited = false;
        
        var out = [];
        var check = [];
        for (var x in cycles) {
            var temp = cycles[x].slice(0);
            temp.sort();
            temp.join(", ");
            temp = "[" + temp + "]";
            if (!check.toString().includes(temp)) {
                check.push(temp);
                out.push(cycles[x]);
            }
        }
        
        return out;
    };
    
};

module.exports = Transmitter;
},{}]},{},[2]);
