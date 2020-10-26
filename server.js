const express = require("express")
const app = express()
const webSocketsInit = require('./infra/WebSockets')

app.use(express.json())

const port = 3001

const main = async() => {
    const server = await webSocketsInit(app)
    return server
}

main().then(server => {
    server.listen(port, () => {
        console.log("Server running on port 3001")
    })
})