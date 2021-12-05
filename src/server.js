import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sockets = [];

// WebSocket Connected
wss.on("connection", (socket) => {
    sockets.push(socket)
    socket["nickname"] = "sola"
    console.log("Connected to Browser 🥕")
    
    // WebSocket Disconneted
    socket.on("close", () => {console.log("Disconnected from the Browser ❌ ")})
    // WebSocket receive the message
    socket.on("message", (message) => {
        const msg = JSON.parse(message)
        console.log("msg: ", msg)
        switch(msg.type){
            case "new_message":
            sockets.forEach((aSocket) => {
                aSocket.send(`${socket.nickname}: ${msg.payload}`)
            })
            case "nickname":
                socket["nickname"] = msg.payload;
        }
    })
});

server.listen(3000, handleListen)