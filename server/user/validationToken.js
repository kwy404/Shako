const {getOtherUsers} = require('../user/getUsers');
const {jsonE} = require("../helpers/parse");

const validationToken = async ({token}, knex, ws) => {
    knex('users').where({
        token: token
      }).select('*').then(function(rows) {
        if(rows.length > 0){
            rows[0].password = undefined
            ws.send(
              jsonE({
                  type: "login",
                  user: rows[0],
                  sucess: true,
                  noMessageError: true,
                  message: ""
                })
            );
            return rows[0]
        } else{
            ws.send(
                jsonE({
                  type: "login",
                  user: {},
                  sucess: false,
                  noMessageError: true,
                  message: ""
                })
            );
            return {}
        }
      })
}

const userConnectToRoom = async ({username}, room, socket) => {
  //Connect to room using socket
  socket.join(room);
  console.log(`Usuario ${username} entrou na sala ${room} privada.`)
  socket.emit('connected', {'user': username, 'sucess': true})
}


const connected = async ({token}, knex, io, socket, sendToRoom, receive) => { 
  knex('users').where({
      token: token
    }).select('*').then(async function(rows) {
      if(rows.length > 0){
          rows[0].password = undefined
          const otherUsers = await getOtherUsersChat({token}, knex, io, socket, sendToRoom, receive)
          await userConnectToRoom(rows[0], `${token}-${rows[0].id}`, socket)
          await ping({token}, knex, io, socket, sendToRoom)
          return rows[0]
      }
    })
}

const getOtherUsersChat = async ({token}, knex, io, socket, sendToRoom, receive) => { 
  knex('users').where({
      token: token
    }).select('*').then(async function(rows) {
      if(rows.length > 0){
          const otherUsers = await getOtherUsers(knex, rows[0], sendToRoom, io, socket)
          socket.emit('getFriendsChat', await otherUsers)
      }
    })
}

const validationTokenIO = async ({token}, knex, io, socket, sendToRoom) => {
  knex('users').where({
      token: token
    }).select('*').then(function(rows) {
      if(rows.length > 0){
          rows[0].password = undefined
          return rows[0]
      }
      return {}
    })
}

const ping = async ({token}, knex, io, socket, sendToRoom) => {
  knex('users').where({
    token: token
  }).select('*').then(async function(rows) {
    if(rows.length > 0){
        rows[0].password = undefined
        await knex('users').where('id', '!=', rows[0].id).then(function(userB) {
          userB.map((userC) => {
            sendToRoom(`${userC.token}-${userC.id}`, 'pong', {'userID': rows[0].id, 'username': rows[0].username, 'message': 'online'}, io, socket)
          })
      })
    }
  })
}

module.exports = {validationToken, connected, validationTokenIO, getOtherUsersChat, ping}