var run = (http) => {

    var io = require('socket.io')(http);
    var Transmitter = require('./share/transmitter');
    
    
    var rooms = {};
    
    
    
    var ENCRYPTION_KEY = "SUp3rK3y"; //Obviously public on GitHub, would need to be changed in actual production, but just for securing saved files;s
    var COLORS = require("./colors");
    
    var Crypter = require("cryptr");
    var cryptr = new Crypter(ENCRYPTION_KEY);
    
    
    
    
    io.on('connection', function(socket){
      console.log('a user connected');
      var game = {};
      
      socket.emit("init");
      
      socket.game = {};
      
      socket.on("upload", function(data) {
        while (true) {
          var room = Math.round(Math.random() * 100000);
          if (!rooms[room]) {
            rooms[room] = JSON.parse(cryptr.decrypt(data));
            rooms[room].room = room;
            
            for (var p in rooms[room].players) {
              rooms[room].players[p].inGame = false;
            }
            
            socket.emit("go to", room);
            break;
          }
        }
        
      });
      
      socket.on("create", function(boardsize, playersize) {
        while (true) {
          var room = Math.round(Math.random() * 100000);
          if (!rooms[room]) {
            rooms[room] = {
              players: {},
              boardsize: boardsize,
              turn: 0,
              playersize: playersize,
              started: false
            };
            rooms[room].room = room;
            socket.emit("go to", room);
            break;
          }
        }
      });
      
      socket.on('join', function(room, name, color) {
        
        if (!rooms[room]) {
          socket.emit("invalid");
          setTimeout(() => socket.disconnect(true), 5000);
          
          
        }
        
        
        else {
        
          socket.gameID = Math.random().toString();
          socket.join(room);
          
          socket.game.name = name;
          
          game = rooms[room];
          
          var inGame = false;
          var playerTaken = false;
          for (var p in game.players) {
            if (game.players[p].name == name) {
              if (game.players[p].inGame) {
                socket.emit("user taken");
                
                playerTaken = true;
                break;
              }
              socket.gameID = p;
              socket.game = game.players[p];
              inGame = true;
              socket.game.inGame = true;
            }
          }
          
          socket.game.room = room;
          
          if (!inGame && !playerTaken) {
            
            socket.game.inGame = true;
            socket.game.tiles = [];
            socket.game.units = [];
            socket.game.verts = [];
            socket.game.edges = [];
            
            var rgb = hsl2rgb(color, 1, .5);
            var num = Math.round(rgb[0]*255)*256*256+Math.round(rgb[1]*255)*256+Math.round(rgb[2]*255);
            num = Math.round(num);
            var hex = num.toString(16);
            hex = "#" + ("0").repeat(6-hex.length) + hex;
            
            socket.game.color = {rgb: rgb, num: num, hex: hex, hue: color/360.0, value:1, name: color.toString()};
            
            
            
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
            
            
          
          }
          
          if (!playerTaken) {
            socket.emit("user data", {color: socket.game.color, id: socket.gameID});
          
            socket.emit("init game", {
              boardsize: rooms[room].boardsize,
              base: socket.game.tiles[0]
            });
            
            
            
            io.to(socket.game.room).emit("update", game);
          }
          
        }
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
          io.to(socket.game.room).emit("end turn", game);
        }
        
        
          
        
        
      });
      
      socket.on("download", () => {
        var out = cryptr.encrypt(JSON.stringify(game));
        socket.emit("download", out);
      });
      
      socket.on("disconnect", () => {
        try {
          //delete game.players[socket.gameID];
          game.players[socket.gameID].inGame = false;
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

function hsl2rgb(h,s,l) 
{
  let a=s*Math.min(l,1-l);
  let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);                 
  return [f(0),f(8),f(4)];
}   



module.exports = run;