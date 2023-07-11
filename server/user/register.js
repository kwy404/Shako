const crypto = require('crypto');
const { userLogin } = require('../user/login');

const discriminationParse = number => {
  const str = "" + number;
  const pad = "0000";
  const ans = pad.substring(0, pad.length - str.length) + str;
  return ans;
};

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

const validateEmail = (email) => {
    // Expressão regular para validar o formato do e-mail
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const userRegister = async ({ email, password, username }, knex, ws) => {
  if (email && password && username) {

    if(!validateEmail(email)){
        JSON.stringify({
            type: "register",
            redirectUrl: "/register",
            sucess: false,
            redirect: false,
            message: "E-mail invalid."
        })
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

      if (count > 0) {
        // Nome de usuário repetido, aumenta o discrimi
        discrimitor = discriminationParse(count + 1);
      } else {
        discrimitor = discriminationParse(1);
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

      await knex('users')
        .insert({
          email: email,
          password: encrypt(password),
          username: username,
          token: token,
          admin: '0',
          avatar: '',
          bg: '',
          discrimination: discrimitor,
          private: false,
          lumis: 0
        });

      ws.send(
        JSON.stringify({
          type: "register",
          redirectUrl: "/login",
          sucess: true,
          redirect: true,
          message: "Register successfuly."
        })
      );
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