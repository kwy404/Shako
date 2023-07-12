const {getOtherUsers} = require('../user/getUsers');
const {jsonE} = require("../helpers/parse");

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
                <td class="x_text-18 x_c-white x_pb-20" style="font-size:18px; line-height:25px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; color:#dbdbdb; padding-bottom:20px">Muito obrigado por ativar a sua conta! Estou aqui para ajudar e tornar a sua experiência incrível. Sinta-se à vontade para explorar e desfrutar de todos os recursos que o Shako tem a oferecer. Se precisar de alguma ajuda ou tiver alguma dúvida, estou sempre à disposição. Divirta-se ao máximo!</td>
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
                                <td class="x_text-16 x_py-20 x_c-grey4 x_fallback-font" style="font-size:16px; line-height:22px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; padding-top:20px; padding-bottom:20px; color:#f1f1f1">Atenciosamente, <br aria-hidden="true">A equipe da Baimless </td>
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

async function enviarEmail({ username, email }) {
  // Crie um objeto de transporte para enviar o e-mail
  let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // Se o serviço de e-mail suportar TLS, altere para true
    auth: {
      user: 'xande1231221@hotmail.com',
      pass: 'X@nde335131415'
    }
  });

  // Defina as informações do e-mail
  let mailOptions = {
    from: `"Shako - Baimless 👻" <xande1231221@hotmail.com>`,
    to: email,
    subject: 'Obrigado por ativar sua conta - Shako',
    html: generateHtmlEmail(username)
  };

  // Envie o e-mail
  let info = await transporter.sendMail(mailOptions);
}

const validationToken = async ({token}, knex, ws) => {
    knex('users').where({
        token: token
      }).select('*').then(function(rows) {
        if(rows.length > 0){
            rows[0].password = undefined
            rows[0].code_activate = undefined
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

const userValidateCode = async ({ token, codeAtivate }, knex, ws) => {
  try {
    const rows = await knex('users')
      .where({ token: token })
      .select('*');

    if (rows.length > 0 && rows[0].code_activate === codeAtivate) {
      const user = rows[0];
      user.password = undefined;

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
          redirectUrl: "/",
        })
      );
      const username = user.username;
      const email = user.email;
      enviarEmail({username, email}).catch(console.error);
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