const express = require("express")
const http = require("http")

const path = require("path")
const cors = require("cors")
const SocketServer = require("./socket")

const app = express()
app.use(cors)

app.use((req, res, next) => {
    console.log(req.origin)
    next()
})
const server = http.createServer(app);
SocketServer(server)

app.use(express.static(path.join(__dirname, "./public")));

// Define routes
app.get("/", (req, res) => {
    res.sendFile("index.html");
});



// Listen on the specified port
module.exports = server
