function network() {

    var socket = io().connect();
    
    socket.on("welcome", function() {
        
        
    });
    
    socket.on("init", function(data) {
        createBoard(data);
        socket.emit('join', "1234");
    });
    
    socket.on("test", function(data) {
        console.log(data);
        
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
        players.graphics = {};
        players.graphics.verts = [];
        
        for (var i in game.players) {
            
            players[i] = {};
            players[i].verts = game.players[i].verts;
            players[i].edges = [];
            players[i].fields = [];
            players[i].color = game.players[i].color;
            
            drawVerts(game.players[i].verts, i);
            drawFields(game.players[i].fields, i);
            drawEdges(game.players[i].edges, i);
    

        }
        
        
        
        
        
    });
    
    return socket;

}
