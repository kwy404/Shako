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

class SpotifyServer {
  constructor(port) {
    this.port = port;
    this.clientUpdateInterval = 2000;
    this.clientSockets = new Map();
  }

  start() {
    this.configureRoutes();
    this.configureSocketIO();
    this.listen();
  }

  configureRoutes() {
    app.get('/', (req, res) => {
      res.send("<h1>Hello World</h1>");
    });
  }

  configureSocketIO() {
    io.on('connection', socket => {
      socket.on('message', this.handleMessage.bind(this, socket));
      socket.on('disconnect', this.handleDisconnect.bind(this, socket));
    });
  }

  async handleMessage(socket, data) {
    const { token } = data.data;
    if (!token) return;

    try {
      const user = await knex('users').where('token', token).first();
      if (!user) return;

      const accessToken = user.spotify;
      this.clientSockets.set(socket, { user, accessToken });

      this.startSongUpdates(socket);
    } catch (error) {
      console.error('Erro ao buscar o token de acesso do usuário:', error);
    }
  }

  handleDisconnect(socket) {
    const clientData = this.clientSockets.get(socket);
    if (clientData) {
      //this.stopSongUpdates(socket);
      this.spotifyCall(clientData.user.spotify_code, clientData.user);
      // this.clientSockets.delete(socket);
    }
  }

  async startSongUpdates(socket) {
    const clientData = this.clientSockets.get(socket);
    if (!clientData) return;

    const { user, accessToken } = clientData;

    try {
      const getCurrentSong = async () => {
        try {
          const [response, responsePlay] = await Promise.all([
            axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
            axios.get('https://api.spotify.com/v1/me/player', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
          ]);

          const { is_playing } = responsePlay.data;
          const { item } = response.data;
          if(typeof item == 'undefined'){
            if(user.isPlaying !== false){
              socket.emit('currentSong', {isPlaying: false});
              this.updateSpotifyObject({isPlaying: false}, user.token);
            }
          }
          item.isPlaying = is_playing;
          const currentSong = item;
          const userMusic = await knex('users').where('token', user.token).first();
          const actualMusic = JSON.parse(userMusic.spotify_object)
          try {
            if(actualMusic.name !== currentSong.name || actualMusic.artists[0].name != currentSong.artists[0].name ||  actualMusic.isPlaying != currentSong.isPlaying){
              socket.emit('currentSong', currentSong);
              this.updateSpotifyObject(currentSong, user.token);
            }
          } catch (error) {
            //console.log(error)
          }
          
        } catch (error) {
          this.spotifyCall(user.spotify_code, user);
        }
      };

      clientData.intervalId = setInterval(getCurrentSong, this.clientUpdateInterval);
    } catch (error) {
      console.error('Erro ao iniciar as atualizações da música:', error);
    }
  }

  stopSongUpdates(socket) {
    const clientData = this.clientSockets.get(socket);
    if (clientData && clientData.intervalId) {
      clearInterval(clientData.intervalId);
    }
  }

  async updateSpotifyObject(currentSong, token) {
    try {
      await knex('users')
        .where('token', token)
        .update({
          spotify_object: JSON.stringify(currentSong)
        });
    } catch (error) {
      console.error('Erro ao atualizar o objeto do Spotify:', error);
    }
  }

  async spotifyCall(code, user) {
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
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        await knex('users')
          .where('token', user.token)
          .update({ spotify: access_token, spotify_refresh_token: refresh_token, spotify_code: code });
      } catch (error) {
        if (error) {
          const refreshTokenParams = new URLSearchParams();
          refreshTokenParams.append('grant_type', 'refresh_token');
          refreshTokenParams.append('refresh_token', user.spotify_refresh_token);
          refreshTokenParams.append('client_id', clientId);

          try {
            const refreshTokenResponse = await axios.post('https://accounts.spotify.com/api/token', refreshTokenParams, config);
            const newAccessToken = refreshTokenResponse.data.access_token;
            if (user.token && user.access_token && user.spotify_refresh_token, code) {
              try {
                await knex('users')
                  .where('token', user.token)
                  .update({ spotify: newAccessToken, spotify_refresh_token: user.spotify_refresh_token, spotify_code: code });

              } catch (error) {
                //
              }
            }
          } catch (refreshTokenError) {
            //
          }
        }
      }
    } catch (error) {
      //
    }
  }

  listen() {
    http.listen(this.port, () => {
      console.log(`Signaling Server Spotify running on port: ${this.port}`);
    });
  }
}

const spotifyServer = new SpotifyServer(4100);
spotifyServer.start();