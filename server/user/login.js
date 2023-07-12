const crypto = require('crypto');

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
      JSON.stringify({
        type: "login",
        user: {},
        sucess: false,
        noMessageError: false,
        message: "E-mail or password is not valid"
      })
      return;
    }
}

module.exports = {userLogin}