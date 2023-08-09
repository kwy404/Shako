const crypto = require('crypto');
const { calcularExpProximoNivel } = require('./exp');

class userLogin {
  constructor(data, knex, ws) {
    if (!data || typeof data !== 'object') {
      return;
    }

    if(data.email.trim().length == 0 || data.password.trim().length == 0){
      ws.send(
        JSON.stringify({
          type: 'login',
          user: {},
          success: false,
          noMessageError: false,
          message: "Fill in the fields below, please."
        })
      );
      return {};
    }

    this.email = data.email;
    this.password = data.password;
    this.knex = knex;
    this.ws = ws;
    this.execute();
  }

  encrypt(password) {
    const cipher = crypto.createCipher('aes256', 'my_little_hex_deca');
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async execute() {
    if (!this.email || !this.password) {
      this.ws.send(
        JSON.stringify({
          type: 'login',
          user: {},
          success: false,
          noMessageError: false,
          message: 'E-mail or password is not valid.'
        })
      );
      return;
    }

    this.password = this.encrypt(this.password);
    const rows = await this.knex('users')
      .where({
        email: this.email,
        password: this.password
      })
      .select('*');

    if (rows.length > 0) {
      rows[0].password = undefined;
      rows[0].code_activate = undefined;
      rows[0].exp_to_next_level = calcularExpProximoNivel(rows[0].nivel + 1);

      if (rows[0].banned == 1) {
        this.ws.send(
          JSON.stringify({
            type: 'login',
            user: {},
            success: false,
            noMessageError: false,
            message: 'Your account is banned.'
          })
        );
        return;
      }

      const followers = await this.knex('followers')
        .join('users', 'users.id', '=', 'followers.sender_id')
        .where({ 'followers.receiver_id': rows[0].id })
        .select('users.id', 'users.username', 'users.email');

      const followersYouFollowBack = await this.knex('followers')
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

      const followersCount = await this.knex('followers')
        .where({ receiver_id: rows[0].id })
        .count('sender_id as count')
        .first();

      const followingCount = await this.knex('followers')
        .where({ sender_id: rows[0].id })
        .count('receiver_id as count')
        .first();

      if(typeof rows[0].spotify_object == 'object'){
        rows[0].spotify_object = JSON.parse(rows[0].spotify_object);
      }
      rows[0].followers = followersWithFollowMe;
      rows[0].followersCount = followersCount.count || 0;
      rows[0].followingCount = followingCount.count || 0;
      const existingInterest = await this.knex('interests')
      .where({ user_id: rows[0].id })
      .first();
      rows[0].selectedInterests = existingInterest ? true: false;

      this.ws.send(
        JSON.stringify({
          type: 'login',
          user: rows[0],
          success: true,
          noMessageError: false,
          message: 'Logged with success.'
        })
      );
    } else {
      this.ws.send(
        JSON.stringify({
          type: 'login',
          user: {},
          success: false,
          noMessageError: false,
          message: 'E-mail or password incorrects.'
        })
      );
    }
  }
}

module.exports = { userLogin };
