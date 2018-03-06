var app = require('express')();         // express
var http = require('http').Server(app); // http
var io = require('socket.io')(http);    // socket.io

//get tag
app.get('/hello', function(req,res){
    res.send('<h1>hello world</h1>');
});

//get file
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
})

//io connection
/*
- io.emit : 접속된 모든 클라이언트에게 메시지를 전송한다.
- socket.emit : 메시지를 전송한 클라이언트에게만 메시지를 전송한다.
- socket.broadcast.emit : 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다.
- io.to(id).emit : 특정 클라이언트에게만 메시지를 전송한다. id는 socket 객체의 id 속성값이다.
*/ 
var chat = io.of('/chat');    //namespace / namspace 지정시 io로 시작하는 내용은 namespace로 변경해서 사용
    chat.on('connection', function(socket){
        console.log('a user connected');
        //io.disconnect
        socket.on('disconnect', function(){
            console.log('user disconnected: ' + socket.name);
            chat.emit("user disconnected:" + socket.name);
        });
        // force client disconnect from server
        socket.on('forceDisconnect', function() {
            socket.disconnect();
        })
        
        // login
        socket.on('login',function(data){
            console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);
            
            socket.name= data.name;
            socket.userid= data.userid;
            socket.room= data.room;
            chat.to(data.room).emit('login',data.name);
        })
        
        // chat
        socket.on('chat', function(data){
            console.log('Message from %s: %s', socket.name, data.msg);
            var msg = {
                from: {
                name: socket.name,
                userid: socket.userid,
                room: socket.room
                },
                msg: data.msg
            };
            socket.join(msg.room);
            //io.socket.emit == io.emit('some event', { for: 'everyone' });
            chat.to(msg.room).emit('chat', msg);
        });
    });
//multiplexing
var news = io.of('/news');
    news.on('connection', function(socket){
        console.log("test")
        socket.emit('item',{news:'item'});
    });


// listen
http.listen(8080, function() {
    console.log('listening on * :8080');
});