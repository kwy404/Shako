const spotify = async (data, knex, io, socket, sendToRoom, receive) => {
    const { token, access_token, spotify_refresh_token,code } = data.receive;
    if(token && access_token && spotify_refresh_token, code){
      try {
        await knex('users')
          .where('token', token)
          .update({ spotify: access_token, spotify_refresh_token: spotify_refresh_token, spotify_code: code});
    
        // 3. Envie uma resposta de sucesso
        const response = {
          success: true,
          message: 'Sucess!',
        };
        socket.emit('spotifyResponse', response);
      } catch (error) {
          //
      }
    }
  };
  
  module.exports = { spotify };
  