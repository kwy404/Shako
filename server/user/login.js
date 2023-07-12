const crypto = require('crypto');
const {calcularExpProximoNivel} = require('./exp');

// Criptografa a senha
function encrypt(password) {
  const cipher = crypto.createCipher('aes256', 'my_little_hex_deca');
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

const userLogin = async ({email, password}, knex, ws) => {
    if(email && password){
      password = encrypt(password)
      knex('users').where({
        email: email,
        password:  password
      }).select('*').then(function(rows) {
        if(rows.length > 0){
            rows[0].password = undefined
            rows[0].code_activate = undefined
            rows[0].exp_to_next_level = calcularExpProximoNivel(rows[0].nivel+1)
            ws.send(
                JSON.stringify({
                  type: "login",
                  user: rows[0],
                  sucess: true,
                  noMessageError: false,
                  message: "Logged with sucess."
                })
            );
            return;
        } else{
            ws.send(
                JSON.stringify({
                  type: "login",
                  user: {},
                  sucess: false,
                  noMessageError: false,
                  message: "E-mail or password incorrects."
                })
            );
            return;
        }
      })
    } else{
      ws.send(JSON.stringify({
        type: "login",
        user: {},
        sucess: false,
        noMessageError: false,
        message: "E-mail or password is not valid"
      }))
      return;
    }
}

module.exports = {userLogin}