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
      }).select('*').then(async function(rows) {
        if(rows.length > 0){
            rows[0].password = undefined
            rows[0].code_activate = undefined
            rows[0].exp_to_next_level = calcularExpProximoNivel(rows[0].nivel+1)
            if(rows[0].banned == 1){
              ws.send(
                JSON.stringify({
                  type: "login",
                  user: {},
                  sucess: false,
                  noMessageError: false,
                  message: "Your account is banned."
                })
              );
              return;
            }

            const followers = await knex('followers')
            .join('users', 'users.id', '=', 'followers.sender_id')
            .where({ 'followers.receiver_id': rows[0].id })
            .select('users.id', 'users.username', 'users.email');

            const followersYouFollowBack = await knex('followers')
              .join('users', 'users.id', '=', 'followers.sender_id')
              .where({ 'followers.receiver_id': rows[0].id })
              .whereIn('followers.sender_id', followers.map(follower => follower.id))
              .select('users.id', 'users.username', 'users.email');

            const followersWithFollowMe = followersYouFollowBack.map(follower => ({
              id: follower.id,
              username: follower.username,
              email: follower.email,
              follow_me: true
            }));

            const followersCount = await knex('followers')
              .where({ receiver_id: rows[0].id })
              .count('sender_id as count')
              .first();
      
            const followingCount = await knex('followers')
              .where({ sender_id: rows[0].id })
              .count('receiver_id as count')
              .first();

            rows[0].followers = followersWithFollowMe;
            rows[0].followersCount = followersCount.count || 0;
            rows[0].followingCount = followingCount.count || 0;
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