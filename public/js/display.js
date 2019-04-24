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
        
        
        var scale = 1/maxZoom;
        var ZOOMSPEED = .8;
        
        var mouseAction = "none";
        var linkTo = -1;
        
        var dragging = false;
        
        var pos;

        
        graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x444444 }, fillStyle: {color: 0x00ff00} });
        
        socket = Network();
        
        this.input.mouse.disableContextMenu();
        
        
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
            
            if (mouseAction == "L" && linkTo != -1) {
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

            if (pointer.buttons == 1) {
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
            }
            
            if (pointer.buttons == 2) {
                
                pos = {};
                pos.cx = (game.scene.scenes[0].cameras.main.scrollX + (config.width/2));//game.scene.scenes[0].cameras.main.zoom;
                pos.cy = (game.scene.scenes[0].cameras.main.scrollY + (config.height/2));///game.scene.scenes[0].cameras.main.zoom;
                pos.x = pointer.x;
                pos.y = pointer.y;
                dragging = true;
                
                console.log(pos);
                
                
            }
            

            
            updateMoves(moves, game.scene.scenes[1], user.color.hex);
            
    
        }, this);
        
        this.input.on('pointerup', function(pointer) {
            if (pointer.buttons == 2) {
                pos = {};
                dragging = false;
            }
        });
        
        this.input.on('pointermove', function (pointer) {
            
            var cam = this.scene.cameras.main;
            
            if (dragging == true) {
                cam.pan(pos.cx + (pos.x-pointer.x)/cam.zoom, pos.cy + (pos.y-pointer.y)/cam.zoom, 10);
                console.log(config.width);
                console.log(cam.zoom);
                console.log(cam.scrollX);
                console.log(pos);
            }
            
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

var h = window.innerHeight;
var w = window.innerWidth;
if (h * 16/9 > w) h = w / (16/9);
else w = h * 16/9;
config.width = w;
config.height = h;


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



