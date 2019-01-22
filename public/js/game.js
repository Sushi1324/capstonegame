var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

var board = [];
var boardsize = 10;
var tilesize = 70;
var graphics;

function preload ()
{
    
}

function create ()
{
    graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x444444 } });
    
    this.cameras.main.setBounds(-1280, -720, 2560, 1440, true);
    this.cameras.main.setZoom(0.5);
    
    
    for (var i = 0; i <= boardsize; i++) {
        board[i] = new Phaser.Geom.Line(-tilesize/2 * (boardsize + i), (tilesize/2 * Math.sqrt(3) * (-i + boardsize)), tilesize/2 * (boardsize+i), (tilesize/2 * Math.sqrt(3) * (-i + boardsize)));
    }
    for (var i = 0; i < boardsize; i++) {
        board[i + boardsize + 1] = new Phaser.Geom.Line(-tilesize/2 * (2 * boardsize - i - 1), (tilesize/2 * Math.sqrt(3) * -(i + 1)), tilesize/2 * (2 * boardsize - i - 1), (tilesize/2 * Math.sqrt(3) * -(i + 1)));
    }
    
    
    for (var i in board) {
        for (var j = 0; j < 3; j ++) {
            graphics.strokeLineShape(board[i]);
            Phaser.Geom.Line.RotateAroundXY(board[i], 0, 0, Math.PI * 2 /3);
        }
        
    }
    
}