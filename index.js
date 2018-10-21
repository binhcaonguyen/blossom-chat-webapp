var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var onlineUsers = [];
// Initialize appication with route / (that means root of the application)



app.get('/', function(req, res){
  var express=require('express');
  app.use(express.static(path.join(__dirname)));
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/uploadFile', function(req, res){
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '/uploads'); 

  form.on('file', (field, file) => {
      fs.rename(file.path, path.join(form.uploadDir, file.name),(err) => {
          if(err) throw err;
          console.log('File renamed successfully '+file.name);
          
      })
  });
  form.on('error', (err) => {
      console.log(err);
  });
  form.on('end', () => {
      console.log('File upload successful')
  });
  
  form.parse(req);
});

// Register events on socket connection
io.on('connection', function(socket){ 
  // Listen to chantMessage event sent by client and emit a chatMessage to the client
  socket.on('chatMessage', function(message){
      io.to(message.receiver).emit('chatMessage', message);
  });
  // Listen to notifyTyping event sent by client and emit a notifyTyping to the client
  socket.on('notifyTyping', function(sender, receiver){
    io.to(receiver.id).emit('notifyTyping', sender, receiver);
  });
  // Listen to newUser event sent by client and emit a newUser to the client with new list of online users
  socket.on('newUser', function(user){
    var newUser = {id: socket.id, name: user};
    onlineUsers.push(newUser);
    io.to(socket.id).emit('newUser', newUser);
    io.emit('onlineUsers', onlineUsers);
  });
  // Listen to disconnect event sent by client and emit userIsDisconnected and onlineUsers (with new list of online users) to the client 
  socket.on('disconnect', function(){
    onlineUsers.forEach(function(user, index){
      if(user.id === socket.id) {
        onlineUsers.splice(index, 1);
        io.emit('userIsDisconnected', socket.id);
        io.emit('onlineUsers', onlineUsers);
      }
    });
  });

  socket.on('newGroup', function(newGroup){
    newGroup.members.forEach(function(member){
      onlineUsers.forEach(function(user){
        if(user.name == member.name)
          member.id = user.id;
      })
    });
    newGroup.members.forEach(function(member){
      io.to(member.id).emit('newGroup', newGroup.name);
    });
  });


  socket.on('acceptGroup', function(name){
    socket.join(name);
  })

  // truong
  socket.on('client-send-file', function(message){
    console.log("Server just receive file named: "+ message.path);
    io.to(message.receiver).emit('server-tra-file', message);
  })

});
// Listen application request on port 3000
http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
