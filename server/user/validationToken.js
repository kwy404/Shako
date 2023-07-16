const {getOtherUsers} = require('../user/getUsers');
const {jsonE} = require("../helpers/parse");
const {calcularExpProximoNivel} = require('./exp');
const {enviarEmail} = require('../helpers/enviar_email');
require('dotenv').config();

const generateHtmlEmail = (username) => {
  return `<td class="x_p-80 x_mpy-35 x_mpx-15" bgcolor="#212429" style="padding:80px">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        
      </tr>
      <tr>
        <td>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <td class="x_title-36 x_pb-30 x_c-grey6 x_fw-b" style="font-size:36px; line-height:42px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; padding-bottom:30px; color:#bfbfbf; font-weight:bold">Caro(a) ${username}</td>
              </tr>
            </tbody>
          </table>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <td class="x_text-18 x_c-white x_pb-20" style="font-size:18px; line-height:25px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; color:#dbdbdb; padding-bottom:20px">Muito obrigado por ativar a sua conta! Estou aqui para ajudar e tornar a sua experiência incrível. <br>Sinta-se à vontade para explorar e desfrutar de todos os recursos que o ${process.env.NAME} tem a oferecer.<br> Se precisar de alguma ajuda ou tiver alguma dúvida, estou sempre à disposição. Divirta-se ao máximo!</td>
              </tr>
            </tbody>
          </table>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              
            </tbody>
          </table>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                
              </tr>
            </tbody>
          </table>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <td class="x_pt-30" style="padding-top:30px">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td class="x_img" width="3" bgcolor="#3a9aed" style="font-size:0pt; line-height:0pt; text-align:left"></td>
                        <td class="x_img" width="37" style="font-size:0pt; line-height:0pt; text-align:left"></td>
                        <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td class="x_text-16 x_py-20 x_c-grey4 x_fallback-font" style="font-size:16px; line-height:22px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; padding-top:20px; padding-bottom:20px; color:#f1f1f1">Atenciosamente, <br aria-hidden="true">A equipe da ${process.env.NAME}. </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</td>`
}

const validationToken = async ({ token }, knex, ws) => {
  try {
    const user = await knex('users')
      .where({ token: token })
      .select('*')
      .first();

    if (user) {
      user.password = undefined;
      user.code_activate = undefined;
      user.exp_to_next_level = calcularExpProximoNivel(user.nivel + 1);

      if (user.banned == 1) {
        ws.send(
          JSON.stringify({
            type: "login",
            user: {},
            success: false,
            noMessageError: false,
            message: "Your account is banned."
          })
        );
        return;
      }

      const followers = await knex('followers')
      .join('users', 'users.id', '=', 'followers.sender_id')
      .where({ 'followers.receiver_id': user.id })
      .select('users.id', 'users.username', 'users.email');

      const followersYouFollowBack = await knex('followers')
        .join('users', 'users.id', '=', 'followers.sender_id')
        .where({ 'followers.receiver_id': user.id })
        .whereIn('followers.sender_id', followers.map(follower => follower.id))
        .select('users.id', 'users.username', 'users.email');

      const followersWithFollowMe = followersYouFollowBack.map(follower => ({
        id: follower.id,
        username: follower.username,
        email: follower.email,
        follow_me: true
      }));

      const followersCount = await knex('followers')
        .where({ receiver_id: user.id })
        .count('sender_id as count')
        .first();

      const followingCount = await knex('followers')
        .where({ sender_id: user.id })
        .count('receiver_id as count')
        .first();

      user.followers = followersWithFollowMe;
      user.followersCount = followersCount.count || 0;
      user.followingCount = followingCount.count || 0;

      ws.send(
        JSON.stringify({
          type: "login",
          user: user,
          success: true,
          noMessageError: true,
          message: ""
        })
      );

      return user;
    } else {
      ws.send(
        JSON.stringify({
          type: "login",
          user: {},
          success: false,
          noMessageError: true,
          message: ""
        })
      );
      return {};
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to validate token');
  }
};


const userConnectToRoom = async ({username}, room, socket) => {
  //Connect to room using socket
  socket.join(room);
  // console.log(`Usuario ${username} entrou na sala ${room} privada.`)
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
        io.emit('pong', {'userID': rows[0].id, 'username': rows[0].username, 'message': 'online'})
        //sendToRoom(`${userC.token}-${userC.id}`, 'pong', {'userID': rows[0].id, 'username': rows[0].username, 'message': 'online'}, io, socket)
    }
  })
}

const userValidateCode = async ({ token, codeAtivate }, knex, ws) => {
  try {
    const rows = await knex('users')
      .where({ token: token })
      .select('*');

    if (rows.length > 0 && rows[0].code_activate === codeAtivate) {
      const user = rows[0];
      user.password = undefined;
      
      if(typeof rows[0].spotify_object == 'object'){
        user.spotify_object = JSON.parse(user.spotify_object);
      }

      await knex('users')
        .where({ token: token, code_activate: codeAtivate })
        .update({ is_activated: '1' });

      ws.send(
        JSON.stringify({
          type: "validateCode",
          user: user,
          success: true,
          noMessageError: true,
          message: "Activated with success.",
          redirect: true,
          redirectUrl: "/dashboard",
        })
      );
      const username = user.username;
      const email = user.email;
      enviarEmail({username, email, code_ativacao: '' }, generateHtmlEmail).catch(console.error);
    } else {
      ws.send(
        JSON.stringify({
          type: "validateCode",
          user: {},
          success: false,
          noMessageError: false,
          message: "Incorrect code.",
          redirect: false,
          redirectUrl: "/",
        })
      );
    }
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: "validateCode",
        user: {},
        success: false,
        noMessageError: true,
        message: "Error occurred.",
        redirect: false,
        redirectUrl: "/",
      })
    );
  }
}


module.exports = {validationToken, connected, validationTokenIO, getOtherUsersChat, ping, userValidateCode}