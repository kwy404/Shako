require('dotenv').config({ path: '.env' });
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});
const axios = require('axios');
const port = 4100;

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Rota para o cliente Socket.IO
app.get('/', (req, res) => {
  res.send("<h1>Hello World</h1>");
});

const updateSpotifyObject = async (currentSong, token) => {
  try {
    // Atualizar o campo `spotify_object` no banco de dados
    await knex('users')
      .where('token', token)
      .update({
        spotify_object: JSON.stringify(currentSong)
      });
  } catch (error) {
    // console.error('Erro ao atualizar o objeto do Spotify:', error);
  }
};

const spotifyCall = async (code, user) => {
  try {
    const clientId = 'dcbdff61d5a443afaba5b0b242893915';
    const clientSecret = 'bc31a0ced0134e95a4e2263e2ab83ba6';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', 'http://localhost:5173/spotify');

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    };

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', params, config);
      const access_token = response.data.access_token
      const refresh_token = response.data.refresh_token // Obtenha o token de atualização do response
      await knex('users')
                .where('token', user.token)
                .update({ spotify: access_token, spotify_refresh_token: refresh_token, spotify_code: code});
    } catch (error) {
      if (error) {
        // O token expirou, então solicite um novo usando o token de atualização
        const refreshTokenParams = new URLSearchParams();
        refreshTokenParams.append('grant_type', 'refresh_token');
        refreshTokenParams.append('refresh_token', user.spotify_refresh_token);
        refreshTokenParams.append('client_id', clientId);

        try {
          const refreshTokenResponse = await axios.post('https://accounts.spotify.com/api/token', refreshTokenParams, config);
          const newAccessToken = refreshTokenResponse.data.access_token;
          if(user.token && user.access_token && user.spotify_refresh_token, code){
            try {
              await knex('users')
                .where('token', user.token)
                .update({ spotify: newAccessToken, spotify_refresh_token: user.spotify_refresh_token, spotify_code: code});
          
              // console.log('newAccessToken', newAccessToken)
            } catch (error) {
              
            }
          }

          // Faça algo com o novo token de acesso

        } catch (refreshTokenError) {
          //
        }
      }
    }
  } catch (error) {
    //
  }
};         

// Configuração do Socket.IO
io.on('connection', socket => {
  // Evento para solicitar o token de acesso do usuário
  socket.on('message', async (data) => {
    const { token } = data.data;
    if (token) {
      try {
        // Buscar o token de acesso do usuário no banco de dados
        const user = await knex('users').where('token', token).first();
        const accessToken = user.spotify;

        // Função para obter as informações da música atual
        const getCurrentSong = async () => {
          try {
            const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const responsePlay = await axios.get('https://api.spotify.com/v1/me/player', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const {is_playing} = responsePlay.data;
 
            const { item } = response.data;
            item.isPlaying = is_playing;

            const currentSong = item;

            updateSpotifyObject(currentSong, token);

            // Envia as informações da música atual para o cliente
            socket.emit('currentSong', currentSong);
          } catch (error) {
            spotifyCall(user.spotify_code, user)
          }
        };

        // Intervalo para atualizar as informações da música atual
        const updateInterval = 2000; // Atualiza a cada 2 segundos
        const intervalId = setInterval(getCurrentSong, updateInterval);

        // Evento de desconexão do cliente
        socket.on('disconnect', () => {
          //console.log('Cliente desconectado.');
          spotifyCall(user.spotify_code, user)
          // Limpa o intervalo quando o cliente desconectar
          clearInterval(intervalId);
        });
      } catch (error) {
        const user = await knex('users').where('token', token).first();
        //console.error('Erro ao buscar o token de acesso do usuário:', error);
        spotifyCall(user.spotify_code, user)
      }
    }
  });
});

// Inicia o servidor HTTP
http.listen(port, () => {
  console.log(`Signaling Server Spotify running on port: ${port}`);
});
