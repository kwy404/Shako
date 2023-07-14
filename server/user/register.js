const crypto = require('crypto');
const { enviarEmail } = require('../helpers/enviar_email');
require('dotenv').config();

class userRegister {
  constructor(data, knex, ws) {
    const { email, password, username } = data;
    if(email, password, username){
      this.email = email;
      this.password = password;
      this.username = username;
      this.knex = knex;
      this.ws = ws;
      this.execute();
    }
  }

  generateHtmlEmail(username, code) {
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
                      <td class="x_text-18 x_c-grey4 x_pb-30" style="font-size:18px; line-height:25px; font-family:Arial,sans-serif,'Motiva Sans'; text-align:left; color:#dbdbdb; padding-bottom:30px">Aqui está o código do ${process.env.NAME} exigido para iniciar a sessão com a conta ${username}:</td>
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
                                              <td class="x_text-16 x_py-20 x_c-grey4 x_fallback-font" style="font-size:16px;line-height:22px;font-family:Arial,sans-serif,'Motiva Sans';text-align:left;padding-top:20px;padding-bottom:20px;color:#f1f1f1;">Atenciosamente,<br aria-hidden="true">A equipe do <span data-markjs="true" class="marklg6kiz2p7" data-ogac="" data-ogab="" data-ogsc="" data-ogsb="">${process.env.NAME}</span> </td>
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
  </table>`;
  }

  discriminationParse(number) {
    const str = "" + number;
    const pad = "0000";
    const ans = pad.substring(0, pad.length - str.length) + str;
    return ans;
  }

  isStrongPassword(password) {
    const regex = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[0-9]).{8,}$/;
    const isStrong = regex.test(password);

    if (isStrong) {
      return {
        strong: true,
        message:
          "A senha é forte. Ela deve conter pelo menos um caractere especial e um número, e ter no mínimo 8 caracteres de comprimento."
      };
    } else {
      return {
        strong: false,
        message:
          "A senha não é forte. Ela deve conter pelo menos um caractere especial e um número, e ter no mínimo 8 caracteres de comprimento."
      };
    }
  }

  encrypt(password) {
    const cipher = crypto.createCipher('aes256', 'my_little_hex_deca');
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  generateToken(length) {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters[randomIndex];
    }
    return token;
  }

  gerarCodigoAtivacao() {
    let codigo = "";
    for (let i = 0; i < 5; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
  }

  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async execute() {
    if (this.email && this.password && this.username) {
      if (!this.validateEmail(this.email)) {
        this.ws.send(
          JSON.stringify({
            type: "register",
            redirectUrl: "/register",
            success: false,
            redirect: false,
            message: "Invalid email. Please try again with a different email."
          })
        );
        return {};
      }

      const existingUser = await this.knex('users')
        .select()
        .where('email', this.email);

      if (existingUser.length > 0) {
        this.ws.send(
          JSON.stringify({
            type: "register",
            redirectUrl: "/register",
            success: false,
            redirect: false,
            message: "Email already exists. Please try again with a different email."
          })
        );
        return {};
      }

      if (!this.isStrongPassword(this.password).strong) {
        this.ws.send(
          JSON.stringify({
            type: "register",
            redirectUrl: "/register",
            success: false,
            redirect: false,
            message: "The password is not strong. It must contain at least one special character and one number, and be at least 8 characters long."
          })
        );
        return {};
      }

      const token = this.generateToken(199);
      let discrimitor = 0;

      const count = await this.knex('users')
        .where('username', this.username)
        .count('id as count')
        .first()
        .then((result) => parseInt(result.count));

      if (count > 0) {
        discrimitor = this.discriminationParse(count + 1);
      } else {
        discrimitor = this.discriminationParse(1);
      }

      if (discrimitor > 9998) {
        this.ws.send(
          JSON.stringify({
            type: "register",
            redirectUrl: "/register",
            success: false,
            redirect: false,
            message: `There are already too many users with this username "${this.username}". Please choose another one.`
          })
        );
        return {};
      }

      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const formattedDay = currentDay < 10 ? `0${currentDay}` : currentDay;
      const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
      const created_at = `${formattedDay}/${formattedMonth}/${currentYear}`;
      const code_ativacao = this.gerarCodigoAtivacao();

      await this.knex('users')
        .insert({
          email: this.email,
          password: this.encrypt(this.password),
          username: this.username,
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
        })
        .then(() => {
          this.ws.send(
            JSON.stringify({
              type: "register",
              redirectUrl: "/registerSuccessfully",
              sucess: true,
              redirect: true,
              message: "Register successfuly, Make login please."
            })
          );

          enviarEmail(
            {
              username: this.username,
              email: this.email,
              code_ativacao,
              subject: `Activation Code - ${process.env.NAME}`
            },
            this.generateHtmlEmail
          ).catch(console.error);

        });
    } else {
      this.ws.send(
        JSON.stringify({
          type: "register",
          redirectUrl: "/register",
          success: false,
          redirect: false,
          message: "Invalid email or password."
        })
      );
    }
  }
}

module.exports = { userRegister };
