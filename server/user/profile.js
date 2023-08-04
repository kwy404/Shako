const {calcularExpProximoNivel} = require('./exp');

function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

const getUserProfile = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
    const {username, discrimination, user_id} = data.receive;
    if(username && discrimination && token && user_id){
        knex('users').where({
          token: token
          }).select('*').then(async function(myProfile) {
            if(myProfile.length > 0){
              if(myProfile[0].id){
                try {
                  const rows = await knex('users').where({
                    username: username,
                    discrimination: discrimination,
                    id: user_id
                  }).select('*');
                  if (rows.length > 0) {
                    rows[0].password = undefined;
                    rows[0].code_activate = undefined;
                    rows[0].exp_to_next_level = calcularExpProximoNivel(rows[0].nivel + 1);
                    rows[0].token = undefined;
                    rows[0].spotify = undefined;
                    rows[0].spotify_refresh_token = undefined;
                    rows[0].spotify_code = undefined;
                    if (isValidJson(rows[0].spotify_object)) {
                      rows[0].spotify_object = JSON.parse(rows[0].spotify_object);
                    } else{
                      rows[0].spotify_object = {}
                    }
                    if(rows[0].banned == 1 && myProfile[0].admin == 0){
                      rows[0].spotify_object = {}
                      socket.emit('profile', {
                        type: "profile",
                        user: rows[0],
                        success: false,
                        noMessageError: true,
                        message: "This account is banned from Shako. "
                      })
                      return {};
                    } else if(rows[0].private == 1){
                      const followMe = await knex('followers')
                      .where({ sender_id: rows[0].id, receiver_id: myProfile[0].id  })
                      .first();
                      const follow = await knex('followers')
                      .where({ sender_id: myProfile[0].id, receiver_id: rows[0].id })
                      .first();
                      if(myProfile[0].id != rows[0].id && myProfile[0].admin == 0 && !followMe && !follow){
                        rows[0].spotify_object = {}
                        socket.emit('profile', {
                          type: "profile",
                          user: rows[0],
                          success: false,
                          noMessageError: true,
                          message: `This account is private.`
                        })
                        return {};
                      }
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

                    const follow = await knex('followers')
                      .where({ sender_id: myProfile[0].id, receiver_id: rows[0].id })
                      .first();

                    const followBack = await knex('followers')
                    .where({ sender_id: rows[0].id, receiver_id: myProfile[0].id  })
                    .first();

                    rows[0].isFollow = follow
                    rows[0].followBack = followBack
                    rows[0].followers = followersWithFollowMe;
                    rows[0].followersCount = followersCount.count || 0;
                    rows[0].followingCount = followingCount.count || 0;

                    socket.emit('profile', {
                      type: "profile",
                      user: rows[0],
                      success: true,
                      noMessageError: true,
                      message: "202"
                    })
                    return rows[0];
                  } else {
                    socket.emit('profile', {
                      type: "profile",
                      user: rows[0],
                      success: false,
                      noMessageError: true,
                      message: "This account doesn’t exist."
                    })
                    return {};
                  }
                } catch (error) {
                  console.log('error', error)
                  return {};
                }
              }
              } else{
                  return {}
              }
        })
      }
  };
  
  module.exports = { getUserProfile };