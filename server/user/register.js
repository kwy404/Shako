const crypto = require('crypto');
const { userLogin } = require('../user/login');

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

const validateEmail = (email) => {
    // Expressão regular para validar o formato do e-mail
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const userRegister = async ({ email, password, username }, knex, ws) => {
  if (email && password && username) {

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

      await knex('users')
        .insert({
          email: email,
          password: encrypt(password),
          username: username,
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
          banned: '0'
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