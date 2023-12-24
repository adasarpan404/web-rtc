const { Server } = require("socket.io")
const http = require("http")
/**
 * 
 * @param {http.Server} server 
 */
const server = server => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    let /** @type {string[]} */activeSockets = [];

    io.on("connection", (socket) => {
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
}
module.exports = server