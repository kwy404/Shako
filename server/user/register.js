const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateHtmlEmail = (username, code) => {
  return `<table width="100%" border="0" cellspacing="0" cellpadding="0" 
  bgcolor="#1f2124" style="padding-top:30px; padding-bottom:30px; padding-left:56px; padding-right:56px">
  <tbody>
     <tr>
        <td>
           <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                 <tr>
                    <td class="x_title-36 x_pb-30 x_c-grey6 x_fw-b" style="font-size:36px; line-height:42px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; padding-bottom:30px; color:#bfbfbf; font-weight:bold">Caro(a) ${username},</td>
                 </tr>
              </tbody>
           </table>
           <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                 <tr>
                    <td class="x_text-18 x_c-grey4 x_pb-30" style="font-size:18px; line-height:25px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; color:#dbdbdb; padding-bottom:30px">Aqui está o código do Shako exigido para iniciar a sessão com a conta ${username}:</td>
                 </tr>
              </tbody>
           </table>
           <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                 <tr>
                    <td class="x_pb-70 x_mpb-50" style="padding-bottom:70px">
                       <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#17191c">
                          <tbody>
                             <tr>
                                <td class="x_py-30 x_px-56" style="padding-top:30px; padding-bottom:30px; padding-left:56px; padding-right:56px">
                                   <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                         <tr>
                                            <td class="x_title-48 x_c-blue1 x_fw-b x_a-center" style="font-size:48px; line-height:52px; font-family:Arial,sans-serif,'Motiva Sans'; color:#3a9aed; font-weight:bold; text-align:center">${code} </td>
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
           
           <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                 <tr>
                    <td class="x_text-18 x_c-blue1 x_pb-40" style="font-size:18px; line-height:25px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; color:#7abefa; padding-bottom:40px"></td>
                 </tr>
              </tbody>
           </table>
           <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tbody>
                 <tr>
                    <td class="x_pt-30" style="padding-top:30px">
                       <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tbody>
                             <tr bgcolor="#17191c">
                                <td class="x_img" width="3" bgcolor="#3a9aed" style="font-size:0pt; line-height:0pt; text-align:left"></td>
                                <td class="x_img" width="37" style="font-size:0pt; line-height:0pt; text-align:left"></td>
                                <td>
                                   <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                         <tr>
                                            <td class="x_text-16 x_py-20 x_c-grey4 x_fallback-font" style="font-size:16px;line-height:22px;font-family:Arial,sans-serif,'Motiva Sans';text-align:left;padding-top:20px;padding-bottom:20px;color:#f1f1f1;">Atenciosamente,<br aria-hidden="true">A equipe do <span data-markjs="true" class="marklg6kiz2p7" data-ogac="" data-ogab="" data-ogsc="" data-ogsb="">Shako</span> </td>
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
</table>`
}

async function enviarEmail({ username, email, code_ativacao }) {
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
    subject: 'Código de ativação - Shako',
    html: generateHtmlEmail(username,code_ativacao)
  };

  // Envie o e-mail
  let info = await transporter.sendMail(mailOptions);
}


const discriminationParse = number => {
  const str = "" + number;
  const pad = "0000";
  const ans = pad.substring(0, pad.length - str.length) + str;
  return ans;
};

function isStrongPassword(password) {
  // Expressão regular para verificar se a senha contém caracteres especiais e números
  const regex = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9]).{8,}$/;
  const isStrong = regex.test(password);

  if (isStrong) {
    return {
      strong: true,
      message: "A senha é forte. Ela deve conter pelo menos um caractere especial e um número, e ter no mínimo 8 caracteres de comprimento."
    };
  } else {
    return {
      strong: false,
      message: "A senha não é forte. Ela deve conter pelo menos um caractere especial e um número, e ter no mínimo 8 caracteres de comprimento."
    };
  }
}

// Criptografa a senha
function encrypt(password) {
  const cipher = crypto.createCipher('aes256', 'my_little_hex_deca');
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

const generateToken = length => {
  //edit the token allowed characters
  var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j];
  }
  return b.join("");
};

function gerarCodigoAtivacao() {
  let codigo = "";
  for (let i = 0; i < 5; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
}

const validateEmail = (email) => {
    // Expressão regular para validar o formato do e-mail
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const userRegister = async ({ email, password, username }, knex, ws) => {
  if (email && password && username) {
    if(!validateEmail(email)){
        ws.send(JSON.stringify({
            type: "register",
            redirectUrl: "/register",
            sucess: false,
            redirect: false,
            message: "E-mail invalid. Try again with other e-mail."
        }))
        return;
    }

    if(!isStrongPassword(password).strong){
      ws.send(JSON.stringify({
        type: "register",
        redirectUrl: "/register",
        sucess: false,
        redirect: false,
        message: "The password is not strong. It must contain at least one special character and one number, and be at least 8 characters long."
    }))
    return;
    }
   
    const token = generateToken(199);
    let discrimi = await knex('users')
      .select('*')
      .forUpdate()
      .noWait();

    const existingUser = await knex('users').select().where('email', email);

    if (existingUser.length === 0) {
      // no matching records found
      discrimi = await knex('users')
        .where('username', username)
        .count('id as count')
        .first();

      const count = parseInt(discrimi.count);
      let discrimitor = 0;
      if (count > 0) {
        // Nome de usuário repetido, aumenta o discrimi
        discrimitor = discriminationParse(count + 1);
      } else {
        discrimitor = discriminationParse(1);
      }

      if(discrimitor > 9999){
        ws.send(JSON.stringify({
          type: "register",
          redirectUrl: "/register",
          sucess: false,
          redirect: false,
          message: `There are already too many users with this ${username}, please create another one.`
        }))
        return;
      }

      //Return erro e-mail already exist.
      knex('users')
      .select()
      .where('email', email)
      .then(function(rows) {
          if (rows.length > 0) {
              ws.send(
                  JSON.stringify({
                      type: "register",
                      redirectUrl: "/register",
                      sucess: false,
                      redirect: false,
                      message: "E-mail already exist. Try again with other e-mail."
                  })
              )
              return;
          }
      })
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth() + 1;  // Os meses são indexados de 0 a 11
      const currentYear = currentDate.getFullYear();
      
      // Adiciona zeros à esquerda para o dia e mês, caso necessário
      const formattedDay = currentDay < 10 ? `0${currentDay}` : currentDay;
      const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
      
      const created_at = `${formattedDay}/${formattedMonth}/${currentYear}`;
      const code_ativacao = gerarCodigoAtivacao();


      await knex('users')
        .insert({
          email: email,
          password: encrypt(password),
          username: username,
          epic: '0',
          token: token,
          admin: '0',
          avatar: '',
          banner: '',
          discrimination: discrimitor,
          private: '0',
          lumis: '0',
          verificado: '0',
          created_at: created_at,
          display_name: '',
          about: '',
          language: 'en',
          beta: '1',
          banned: '0',
          website: "",
          nivel: 0,
          code_activate: code_ativacao,
          is_activated: 0,
          exp: 0
        }).then(() => {
          ws.send(
              JSON.stringify({
              type: "register",
              redirectUrl: "/registerSucessfully",
              sucess: true,
              redirect: true,
              message: "Register successfuly."
              })
          );
          // Chame a função para enviar o e-mail
          enviarEmail({username, email, code_ativacao}).catch(console.error);
      })
    } else {
      ws.send(
        JSON.stringify({
          type: "register",
          redirectUrl: "/register",
          sucess: false,
          redirect: false,
          message: "E-mail already exists. Try again with another e-mail."
        })
      );
    }
  } else {
    ws.send(
      JSON.stringify({
        type: "register",
        redirectUrl: "/register",
        sucess: false,
        redirect: false,
        message: "E-mail or password is not valid."
      })
    );
  }
};

module.exports = { userRegister };