const express = require("express");
const http = require("http");
const app = express();
const cors = require('cors')
const {knex} = require('../migrations');
const {dashboard} = require('../app/dashboard')

const portWSS = process.env.PORT || 9090;

//initialize a http server
const serverWSS = http.createServer(app);

const io = require('socket.io')(serverWSS, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  dashboard(socket, knex, io)
});


//start our server WSS
serverWSS.listen(portWSS, () => {
  console.log(`Signaling Server Dashboard running on port: ${portWSS}`);
});