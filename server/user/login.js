const crypto = require('crypto');

// Criptografa a senha
function encrypt(password) {
  const cipher = crypto.createCipher('aes256', 'my_little_hex_deca');
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function calcularExpProximoNivel(level) {
  // Constantes
  var pi = Math.PI;
  var aceleracaoGravitacional = 9.8; // m/s^2

  // Parâmetros da fórmula
  var massaObjeto = 10; // kg
  var alturaInicial = 5; // metros

  // Cálculo do tempo de queda usando a fórmula da física
  var tempoQueda = Math.sqrt((2 * alturaInicial) / aceleracaoGravitacional);

  // Cálculo do raio do círculo usando o número pi
  var raioCirculo = level * pi;

  // Cálculo da área do círculo usando a fórmula matemática
  var areaCirculo = pi * Math.pow(raioCirculo, 2);

  // Cálculo do EXP necessário baseado na área do círculo e na massa do objeto
  var expProximoNivel = areaCirculo * massaObjeto * tempoQueda;

  return `${Math.round(expProximoNivel, 1)}`;
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