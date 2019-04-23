var socket;

function joinRoom() {
  window.location = "room/" + document.getElementById("room").value;
}

function createRoom() {
  console.log("Creating");
  socket.emit("create", parseInt($("#boardsize").val()), parseInt($("#playersize").val()));
}


window.onload = function() {

  $("input:file").change(function() {
    var filename = $(this).val();
    filename = filename.slice(filename.lastIndexOf("\\") + 1);
    $(".custom-file-upload").html("Upload: " + filename);
    $(".modal-title").html("Upload: " + filename);
    $("#uploaded").modal();
   // readFile(this.files[0]);
  });
  
  $(".upload-submit").click(function() {
    
    readFile($("input:file")[0].files[0]);
    
  });
  
  $(".custom-submit-button").click(createRoom);
  
  
  socket = io().connect();
    
  
  
  socket.on("go to", function(room) {
    window.location = "/room/" + room;
  });
  
};

function readFile(file) {
  var reader = new FileReader();
  
  reader.onload = function(event) {
    var out = (event.target.result);
    socket.emit("upload", out);
    
  };
  reader.readAsText(file);
}