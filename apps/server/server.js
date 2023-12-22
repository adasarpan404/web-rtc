const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors")

const app = express();
app.use(cors)

app.use((req, res, next) => {
    console.log(req.origin)
    next()
})
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});


let activeSockets = [];

app.use(express.static(path.join(__dirname, "./public")));

// Define routes
app.get("/", (req, res) => {
    res.sendFile("index.html");
});

io.on("connection", (socket) => {
    console.log(socket);
    const existingSocket = activeSockets.find(
        (existingSocket) => existingSocket === socket.id
    );

    if (!existingSocket) {
        activeSockets.push(socket.id);

        socket.emit("update-user-list", {
            users: activeSockets.filter(
                (existingSocket) => existingSocket !== socket.id
            ),
        });

        socket.broadcast.emit("update-user-list", {
            users: [socket.id],
        });
    }

    socket.on("call-user", (data) => {
        socket.to(data.to).emit("call-made", {
            offer: data.offer,
            socket: socket.id,
        });
    });

    socket.on("make-answer", (data) => {
        socket.to(data.to).emit("answer-made", {
            socket: socket.id,
            answer: data.answer,
        });
    });

    socket.on("reject-call", (data) => {
        socket.to(data.from).emit("call-rejected", {
            socket: socket.id,
        });
    });

    socket.on("disconnect", () => {
        activeSockets = activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
            socketId: socket.id,
        });
    });
});

// Listen on the specified port
module.exports = server
