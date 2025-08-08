let ioInstance = null
const onlineUsers = new Map()

function setIO(io) {
    ioInstance = io;
}

function getIO() {
    if (!ioInstance) throw new Error("Socket.io has not been initialized!");
    return ioInstance;
}

module.exports = {
    setIO,
    getIO,
    onlineUsers
}
