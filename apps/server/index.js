const server = require("./server")


const DEFAULT_PORT = 5000
server.listen(DEFAULT_PORT, () => {
    console.log(`Server is listening on http://localhost:${DEFAULT_PORT}`);
});