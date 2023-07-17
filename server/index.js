const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const app = express();
const cors = require('cors')
const {parseMessage} = require('./webrtc/parse');
const {knex} = require('./migrations');
const {dashboard} = require('./app/dashboard')
const port = process.env.PORT || 9011;

//initialize a http server
const server = http.createServer(app);

const portWSS = process.env.PORT || 9091;

//initialize a http server
const serverWSS = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const io = require('socket.io')(serverWSS, {
  cors: {
    origin: '*',
  }
});

wss.on("connection", ws => {
  ws.on("message", msg => {
    const msgReceive = msg.toString()
    try {
        const json = JSON.parse(msgReceive)
        parseMessage(json, ws, knex, app, io)  
    } catch (error) {
        console.log(error)
    }
  });
  //When connect send again to validate token
  ws.send(
    JSON.stringify({
      type: "validateToken"
    })
);
});

io.on('connection', (socket) => {
  dashboard(socket, knex, io)
});

//start our server
server.listen(port, () => {
  console.log(`Signaling Server App running on port: ${port}`);
});

//start our server WSS
serverWSS.listen(portWSS, () => {
  console.log(`Signaling Server Dashboard running on port: ${portWSS}`);
});