function run(http) {

    var io = require('socket.io')(http);
    
    io.on('connection', function(socket){
      console.log('a user connected');
    });
    
    
    return io;
}

module.exports = run;