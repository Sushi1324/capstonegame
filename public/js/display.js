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

