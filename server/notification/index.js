function generateToken(length) {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters[randomIndex];
    }
    return token;
}

const notification = async ({user, receiveUser, message}, knex, io, socket, sendToRoom, receive) => {
    if(user && receiveUser && message){
        await knex('notification').insert({
            sender_id: user.id,
            receiver_id: receiveUser.id,
            message: message,
            status: '',
            notification_object: '{}'
        });
        user.token = undefined;
        user.spotify = undefined;
        user.spotify_refresh_token = undefined;
        user.spotify_code = undefined;
        
        sendToRoom(receiveUser, 'notification', {
            type: "notification",
            user: user,
            success: true,
            noMessageError: true,
            message: message,
            status: 'send',
            notification_object: {},
            id: generateToken(10)
        }, io, socket);
    }
};
  
module.exports = { notification };
  