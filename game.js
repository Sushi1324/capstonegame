var run = (http) => {

    var io = require('socket.io')(http);
    var Transmitter = require('./share/transmitter');
    
    
    var rooms = {};
    
    
    
    var COLORS = [{num: 0xFF0000, hex: "#FF0000", hue: 0, value: 1, name: "Red"}, {num: 0x800000, hex: "#800000", hue: 0, value: .5, name: "Red2"}, {num: 0xFFFF00, hex: "#FFFF00", hue: 1/6, value: 1, name: "Yellow"}, {num: 0x808000, hex: "#808000", hue: 1/6, value: .5, name: "Yellow2"}, {num: 0x00FF00, hex: "#00FF00", hue: 1/3, value: 1, name: "Green"}, {num: 0x008000, hex: "#008000", hue: 1/3, value: .5, name: "Green2"}, {num: 0x00FFFF, hex: "#00FFFF", hue: .5, value: 1, name: "Cyan"}, {num: 0x008080, hex: "#008080", hue: .5, value: .5, name: "Cyan2"}, {num: 0x0000FF, hex: "#0000FF", hue: 2/3, value: 1, name: "Blue"}, {num: 0x000080, hex: "#000080", hue: 2/3, value: .5, name: "Blue2"}, {num: 0xFF00FF, hex: "#FF00FF", hue: 5/6, value: 1, name: "Magenta"}, {num: 0x800080, hex: "#800080", hue: 5/6, value: .5, name: "Magenta2"}];
    
    
    
    var BOARDSIZE = 10;
    
    
    io.on('connection', function(socket){
      console.log('a user connected');
      var game = {};
      
      socket.emit("init");
      
      socket.game = {};
      
      socket.on('join', function(room, name) {
        socket.gameID = Math.random().toString();
        socket.join(room);
        if (!rooms[room]) {
          rooms[room] = {
            players: {},
            boardsize: BOARDSIZE,
            turn: 0
          };
          
        }
        socket.game.name = name;
        
        game = rooms[room];
        
        
        socket.game.tiles = [];
        socket.game.units = [];
        socket.game.verts = [];
        socket.game.edges = [];
        
        socket.game.color = COLORS[Math.trunc(Math.random() * COLORS.length)];
        
        socket.emit("user data", {color: socket.game.color, id: socket.gameID});
        
        socket.game.room = room;
        
        var base = {};
        
        
        
        var invalid = true;
        var counter = 0;
        
        while (invalid && counter < 1000) {
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
            
          }
          
          invalid = (socket.game.verts[2].x < game.boardsize + 1 && socket.game.verts[2].y > game.boardsize + socket.game.verts[2].x) || (socket.game.verts[1].x > game.boardsize && socket.game.verts[1].y < socket.game.verts[1].x - game.boardsize);
          
          invalid = !(!invalid && validLink(socket.game, game.players, 0, 1, game.boardsize) && validLink(socket.game, game.players, 0, 2, game.boardsize) && validLink(socket.game, game.players, 1, 2, game.boardsize));
          
          invalid = !(!invalid && validTrans(socket.game, game.players, socket.game.verts[0]) && validTrans(socket.game, game.players, socket.game.verts[1]) && validTrans(socket.game, game.players, socket.game.verts[2]));
          
          counter++;
        }
        
        
        if (counter < 1000) {
        
          link(socket.game, game.players, 0, 1, game.boardsize);
          link(socket.game, game.players, 0, 2, game.boardsize);
          link(socket.game, game.players, 1, 2, game.boardsize);
          
          
          socket.game.fields = (socket.game.verts[0].dfs(socket.game.verts, [], []));
          
          socket.game.tiles[0] = base;
          
          game.players[socket.gameID] = socket.game;
        }
        
        
        else {
          console.log("server full");
          socket.game.verts = [];
        }
        
        
        socket.game.score = calculateScore(socket.game.fields, game.boardsize, socket.game.verts);
        
        socket.emit("init game", {
          boardsize: rooms[room].boardsize,
          base: base
        });
        
        
        io.to(socket.game.room).emit("update", game);
        
        
      });
      
      socket.on("turn", (moves) => {
        socket.game.moves = moves;
        game.players[socket.gameID] = socket.game;
        
        var done = true;
        for (var player in game.players) {
          if (!game.players[player].moves) {
            done = false;
            break;
          }
        }
        
        if (done) {
          for (var player in game.players) {
            moves = game.players[player].moves;
            for (var i in moves) {
              if (moves[i].type === "trans+") {
                var tempVert = new Transmitter(moves[i].x, moves[i].y, game.players[player].verts[game.players[player].verts.length-1].id + 1);
                if (validTrans(game, game.players, tempVert)) game.players[player].verts.push(tempVert);
              }
              
              if (moves[i].type === "link+") {
                  if(validLink(game.players[player], game.players, moves[i].a, moves[i].b, game.boardsize)) {
                      link(game.players[player], game.players, moves[i].a, moves[i].b, game.boardsize);
                      game.players[player].fields = game.players[player].verts[moves[i].a].dfs(game.players[player].verts, [], game.players[player].fields);
                      
                      game.players[player].score = calculateScore(game.players[player].fields, game.boardsize, game.players[player].verts);

                  }
              }
            }
            delete game.players[player].moves;
          }
          game.turn ++;
          io.to(socket.game.room).emit("update", game);
        }
        
        
          
        
        
      });
      
      socket.on("disconnect", () => {
        try {
          delete game.players[socket.gameID];
        }
        catch(e) {
          console.log(e);
        }
        
        console.log("a user disconnected");
        if (socket.game) {
          io.to(socket.game.room).emit("update", game);
        }
        
      });
      
      
    });
    
    return io;
};


function link(game, players, a, b, size) {
  
  
  if (validLink(game, players, a, b, size)) {
    game.verts[a].addLink(game.verts[b]);
    game.edges.push([a, b]);
  }
}

function validLink(game, players, a, b, size) {
  
  var simCoords = require('./share/coords');
  
  for (var player in players) {
    for (var l in players[player].edges) {
      var v1 = simCoords(game.verts[a].x, game.verts[a].y, size);
      var v2 = simCoords(game.verts[b].x, game.verts[b].y, size);
      var v3 = simCoords(players[player].verts[players[player].edges[l][0]].x,players[player].verts[players[player].edges[l][0]].y, size);
      var v4 = simCoords(players[player].verts[players[player].edges[l][1]].x,players[player].verts[players[player].edges[l][1]].y, size);
      if (intersects(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, v4.x, v4.y)) {
        return false;
      }
      
    }
  }
  return true;
}

function validTrans(game, players, vert) {
  if (vert.x < 0 || vert.y < 0) return false;
  if (vert.x > game.boardsize * 2 || vert.y > game.boardsize * 2) return false;
  if ((vert.x < game.boardsize + 1 && vert.y > game.boardsize + vert.x) || (vert.x > game.boardsize && vert.y < vert.x - game.boardsize)) return false;
  
  for (var player in players) {
    for (var l in players[player].verts) {
      if (vert.x == players[player].verts[l].x && vert.y == players[player].verts[l].y) return false;
    }
  }
  
  return true;
}


function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}


function calculateScore(fields, boardsize, verts) {
  var simCoords = require('./share/coords');
  var score = 0;
  
  for (var f in fields) {
    var temp = [];
    var field = fields[f];
    
    for (var vert in field) {
      temp.push(simCoords(verts[field[vert]].x, verts[field[vert]].y, boardsize));
      score += calcPolygonArea(temp);
    }
  }
  score /= (Math.sqrt(3) * 50 * 50);
  return Math.round(score);
}

// Taken from answer at https://stackoverflow.com/questions/16285134/calculating-polygon-area
function calcPolygonArea(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

    return Math.abs(total);
}


module.exports = run;