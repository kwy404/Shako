const { connected, getOtherUsersChat, ping } = require('../user/validationToken');
const { getUserProfile } = require('../user/profile');
const { banUser } = require('../admin/banUser');
const { followUser } = require("../user/follower");
const { searchUsers } = require('../user/search');
const { spotify } = require("../user/spotify");
const { sendMessage, getMensagens, getLastMensagens } = require("../user/messenger");
const { suggestedUsers } = require("../user/sugeredUser");
const { youtube } = require("../games/youtube");
const { saveInteresses } = require("../user/saveInteresses");
const { publishStory } = require("../user/stories/stories");


const dashboard = async (socket, knex, io) => {
    socket.on('message', async msg => {
      try {
        const data = msg.data
        const receive = msg.data.receive
        const type = data.type
        await parseMessage(type, data, knex, io, socket, receive)
      } catch (error) {
        //Why so many codes, if your life no make sense
      }
    });
}

const parseMessage = async (type, data, knex, io, socket, receive) => {
  // Call function from parseMessage, from socket.io
  await types[type](data, knex, io, socket, sendToRoom, receive)
}

const sendToRoom = async (room, event, data, io, socket) => {
  const roomD = `${room.token}-${room.id}`;
  if (io.sockets.adapter.rooms.has(roomD)) {
    io.sockets.in(roomD).emit(event, data);
    socket.broadcast.to(roomD).emit(event, data);
  }
};

// Object types with function call
const types = {
  'connected': connected,
  'getFriends': getOtherUsersChat,
  'ping': ping,
  'getProfile': getUserProfile,
  'banUser': banUser,
  'follow': followUser,
  'searchUsers': searchUsers,
  'spotify': spotify,
  'chatContainer': sendMessage,
  'getLastMensagens': getLastMensagens,
  'getMensagens': getMensagens,
  'suggestedUsers': suggestedUsers,
  'youtube': youtube,
  'saveInteresses': saveInteresses,
  'publishStory': publishStory // Storie
}

module.exports = {dashboard}