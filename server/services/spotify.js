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
            //console.error('Erro ao obter a música atual:', error);
          }
        };

        // Intervalo para atualizar as informações da música atual
        const updateInterval = 2000; // Atualiza a cada 5 segundos
        const intervalId = setInterval(getCurrentSong, updateInterval);

        // Evento de desconexão do cliente
        socket.on('disconnect', () => {
          //console.log('Cliente desconectado.');

          // Limpa o intervalo quando o cliente desconectar
          clearInterval(intervalId);
        });
      } catch (error) {
        //console.error('Erro ao buscar o token de acesso do usuário:', error);
      }
    }
  });
});

// Inicia o servidor HTTP
http.listen(port, () => {
  console.log(`Signaling Server Spotify running on port: ${port}`);
});
