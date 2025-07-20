const express = require("express");
const bodyParser = require("body-parser");
const {Server} = require("socket.io");

const io =  new Server({
    cors: true,
});
const app = express();

app.use(bodyParser.json());

const email_to_socket_mapping = new Map();
const socket_to_email_mapping = new Map();

io.on("connection" , socket => {
    console.log("New-Connection");
    socket.on("join-room" , data => {
        const {roomID, emailID} = data;
        console.log("user", emailID , "joined-room :", roomID);
        email_to_socket_mapping.set(emailID, socket.id)
        socket_to_email_mapping.set(socket.id, emailID);

        socket.join(roomID);
        socket.emit("joined-room" , {roomID});
        socket.broadcast.to(roomID).emit("User-Joined", {emailID});
    });

    socket.on("Call-user" , (data) => {
        const {emailID, offer} = data;
        const fromEmail = socket_to_email_mapping.get(socket.id);
        const socketId = email_to_socket_mapping.get(emailID);
        socket.to(socketId).emit("Incoming-Call" , {from: fromEmail, offer});
    });

    socket.on("Call-Accepted", (data) =>{
        const {emailID, ans} = data;
        const socketId = email_to_socket_mapping.get(emailID);
        socket.to(socketId).emit("Call-Accepted" , {ans});
    });
});

app.listen (8000 , () => console.log("Listening to PORT: 8000"));
io.listen(8001);
