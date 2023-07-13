const nodemailer = require('nodemailer');

const generateHtmlEmail = (username, banned) => {
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
                  <td class="x_text-18 x_c-white x_pb-20" style="font-size:18px; line-height:25px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; color:#dbdbdb; padding-bottom:20px">
                  ${banned == 1 ? 'Lamentamos informar que sua conta foi banida devido a violações das regras do servidor. 😔 Se você tiver alguma dúvida ou precisar de assistência, entre em contato com o suporte para obter mais informações. Agradecemos sua compreensão. 🙏' : 'Temos ótimas notícias para você! Um moderador revisou seu caso e decidiu desbanir sua conta. 🎉 Pedimos desculpas pelos inconvenientes causados e agradecemos sua compreensão durante o período de banimento. Agora você está livre para aproveitar novamente todos os recursos do servidor. Se tiver alguma dúvida ou precisar de assistência adicional, não hesite em entrar em contato com o suporte. Divirta-se ao máximo! 🥳'}
                  </td>
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

async function enviarEmail({ username, email }, banned) {
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
      subject: `${banned == 1 ? 'Você foi banido' : 'Você foi desbanido'} - Shako`,
      html: generateHtmlEmail(username, banned)
    };
  
    // Envie o e-mail
    let info = await transporter.sendMail(mailOptions);
}

const banUser = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
    const userId = data.receive.id;
    if(token && userId){
        try {
            const admin = await knex('users')
              .where({ token: token, admin: '1' })
              .select('*')
              .first();
        
            if (admin == 0) {
              io.emit('profile', {
                  type: "profileBanned",
                  user: userId,
                  success: false,
                  noMessageError: false,
                  message: "Unauthorized access.",
                  redirect: false,
                  redirectUrl: "/",
                })
              return;
            }
        
            const user = await knex('users')
              .where({ id: userId })
              .select('*')
              .first();
        
            if (!user) {
              io.emit('profile', {
                type: "profileBanned",
                user: userId,
                success: false,
                noMessageError: false,
                message: "User not found.",
                redirect: false,
                redirectUrl: "/",
              })
              return;
            }
        
            if (user.banned == 1) {
              // Unban the user
              await knex('users')
                .where({ id: userId })
                .update({ banned: '0' });
      
              io.emit('profile', {
                  type: "profileBanned",
                  user: userId,
                  success: true,
                  noMessageError: true,
                  message: "User has been unbanned.",
                  redirect: false,
                  redirectUrl: "/",
                  banned: '0'
              })
              sendToRoom(`${user.token}-${user.token}`, 'profile', {
                type: "profileBanned",
                user: userId,
                success: true,
                noMessageError: true,
                message: "User has been unbanned.",
                redirect: false,
                redirectUrl: "/",
                banned: '0'
                }, io, socket)
                enviarEmail({username: user.username, email: user.email}, 0).catch(console.error);
            } else {
              // Ban the user
              await knex('users')
                .where({ id: userId })
                .update({ banned: '1' });
      
              io.emit('profile', {
                  type: "profileBanned",
                  user: userId,
                  success: true,
                  noMessageError: true,
                  message: "User has been banned.",
                  redirect: false,
                  redirectUrl: "/",
                  banned: '1'
              })

              enviarEmail({username: user.username, email: user.email}, 1).catch(console.error);

              sendToRoom(`${user.token}-${user.token}`, 'profile', {
                type: "profileBanned",
                user: userId,
                success: true,
                noMessageError: true,
                message: "User has been banned.",
                redirect: false,
                redirectUrl: "/",
                banned: '1'
                }, io, socket)
              
            }
          } catch (error) {
            io.emit('profile', {
              type: "profileBanned",
              user: userId,
              success: false,
              noMessageError: true,
              message: "Error occurred.",
              redirect: false,
              redirectUrl: "/",
            })
          }
    }
  };
  
module.exports = {banUser}