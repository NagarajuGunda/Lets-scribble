const http = require("http")
const socket = require("socket.io")
const uuid = require("uuid")
const { createRoom, joinRoom, disconnect } = require("../utils/room")
const { startGame, nextTurn, startGuessing } = require("../utils/game")

const webSocketsInit = app => {
    const server = http.Server(app)
    const io = socket(server)

    io.on("connection", socket => {
        console.log("New connection: " + socket.id)

        socket.on("create room", async(name) => {
            createRoom(socket, name)
        })

        socket.on("join room", ({ room, name }) => {
            joinRoom(io, socket, room, name)
        })

        socket.on("start game", () => {
            startGame(io, socket)
        })

        socket.on("drawing", data => {
            console.log(data)
            socket.broadcast.to(socket.roomID).emit("receiveStrokes", data)
        })

        socket.on("next turn", () => {
            nextTurn({ io, roomID: socket.roomID })
        })

        socket.on("chosen word", word => {
            startGuessing({ roomID: socket.roomID, word, socket }) // this word will be sent in hashed format, will do this later
        })

        socket.on("disconnect", () => {
            console.log(socket.id + "left")
            disconnect(io, socket)
        })
    })

    return server
}

module.exports = webSocketsInit