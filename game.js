function run(http) {

    var io = require('socket.io')(http);
    var Transmitter = require('./share/transmitter.js');
    
    var rooms = {};
    
    var game = {};
    
    var COLORS = [0xFFFF00,0x808000,0x00FF00,0x008000,0x00FFFF,0x008080,0x0000FF,0x000080,0xFF00FF,0x800080];
    
    game.boardsize = 15;
    game.players = {};
    
    
    
    
    io.on('connection', function(socket){
      console.log('a user connected');
      socket.emit("welcome");
      socket.emit("init", game.boardsize);
    
      
      socket.on('join', function(room) {
        socket.gameID = Math.random().toString();
        socket.join(room);
        if (!rooms[room]) {
          rooms[room] = {};
          rooms[room].players = [];
        }
        
        
        socket.game = {};
        socket.game.tiles = [];
        socket.game.units = [];
        socket.game.verts = [];
        socket.game.edges = [];
        
        socket.game.color = COLORS[Math.trunc(Math.random() * COLORS.length)];
        
        socket.game.room = room;
        
        var base = {};
        
        
        
        var invalid = true;
        
        while (invalid) {
          invalid = false;
          socket.game.verts = [];
          
          base.x = Math.trunc(Math.random() * (2 * game.boardsize - 4)) + 2;
          base.y = Math.trunc(Math.random() * (2 * game.boardsize - 5)) + 3;
          base.up = (Math.random() > 0.5);
        
          if (base.up) {
            
            socket.game.verts.push(new Transmitter(base.x-2, base.y-1, 0));
            socket.game.verts.push(new Transmitter(base.x+2, base.y-1, 1));
            socket.game.verts.push(new Transmitter(base.x+2, base.y+3, 2));
            
          }
          
          else {
            socket.game.verts.push(new Transmitter(base.x+3, base.y+1, 0));
            socket.game.verts.push(new Transmitter(base.x-1, base.y-3, 1));
            socket.game.verts.push(new Transmitter(base.x-1, base.y+1, 2));
            
            /*
            socket.game.verts.push(new Transmitter(base.x-5, base.y-3, 3));
            
            socket.game.verts[3].addLink(socket.game.verts[2]);
            socket.game.verts[3].addLink(socket.game.verts[1]);
          
            
            socket.game.edges.push([1, 3]);
            socket.game.edges.push([2, 3]);
            //*/
          }
          
          invalid = (socket.game.verts[2].x < game.boardsize + 1 && socket.game.verts[2].y > game.boardsize + socket.game.verts[2].x) || (socket.game.verts[1].x > game.boardsize && socket.game.verts[1].y < socket.game.verts[1].x - game.boardsize);
          
          
        }
        
        
        
        
        //Temporary way of adding links
        socket.game.verts[0].addLink(socket.game.verts[1]);
        socket.game.verts[1].addLink(socket.game.verts[2]);
        socket.game.verts[2].addLink(socket.game.verts[0]);
        
        socket.game.edges.push([0, 1]);
        socket.game.edges.push([1, 2]);
        socket.game.edges.push([0, 2]);
        
        
        
        socket.game.fields = (socket.game.verts[0].dfs(socket.game.verts, []));
        
        socket.game.tiles[0] = base;
        
        game.players[socket.gameID] = socket.game;
        
        
        
        io.to(socket.game.room).emit("update", game);
        
        
      });
      
      socket.on("disconnect", function() {
        delete game.players[socket.gameID];
        console.log("a user disconnected");
        if (socket.game) {
          io.to(socket.game.room).emit("update", game);
        }
        
      });
      
      
    });
    
    
    
    
    
    return io;
}




module.exports = run;