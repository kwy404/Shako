const { calcularExpProximoNivel } = require('./exp');

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
  const { username, discrimination, user_id } = data.receive;
  if (!username || !discrimination || !token || !user_id) {
    return socket.emit('profile', {
      type: 'profile',
      user: {},
      success: false,
      noMessageError: true,
      message: 'Invalid request data.',
    });
  }

  try {
    const myProfile = await knex('users')
      .where({ token: token })
      .select('id', 'admin')
      .first();

    if (!myProfile || !myProfile.id) {
      return socket.emit('profile', {
        type: 'profile',
        user: {},
        success: false,
        noMessageError: true,
        message: 'Invalid token.',
      });
    }

    const rows = await knex('users')
      .where({
        username: username,
        discrimination: discrimination,
        id: user_id,
      })
      .select('*');

    if (rows.length === 0) {
      return socket.emit('profile', {
        type: 'profile',
        user: {},
        success: false,
        noMessageError: true,
        message: "This account doesn't exist.",
      });
    }

    const profileData = rows[0];
    profileData.password = undefined;
    profileData.code_activate = undefined;
    profileData.exp_to_next_level = calcularExpProximoNivel(profileData.nivel + 1);
    profileData.token = undefined;
    profileData.spotify = undefined;
    profileData.spotify_refresh_token = undefined;
    profileData.spotify_code = undefined;
    profileData.spotify_object = isValidJson(profileData.spotify_object)
      ? JSON.parse(profileData.spotify_object)
      : {};

    if (profileData.banned === 1 && myProfile.admin === 0) {
      profileData.spotify_object = {};
      socket.emit('profile', {
        type: 'profile',
        user: profileData,
        success: false,
        noMessageError: true,
        message: 'This account is banned from Shako. ',
      });
      return profileData;
    } else if (profileData.private === 1) {
      const followMe = await knex('followers')
        .where({ sender_id: profileData.id, receiver_id: myProfile.id })
        .first();
      const follow = await knex('followers')
        .where({ sender_id: myProfile.id, receiver_id: profileData.id })
        .first();

      if (myProfile.id !== profileData.id && myProfile.admin === 0 && !followMe && !follow) {
        profileData.spotify_object = {};
        socket.emit('profile', {
          type: 'profile',
          user: profileData,
          success: false,
          noMessageError: true,
          message: `This account is private.`,
        });
        return profileData;
      }
    }

    const followers = await knex('followers')
      .join('users', 'users.id', '=', 'followers.sender_id')
      .where({ 'followers.receiver_id': profileData.id })
      .select('users.id', 'users.username', 'users.email');

    const followersYouFollowBack = await knex('followers')
      .join('users', 'users.id', '=', 'followers.sender_id')
      .where({ 'followers.receiver_id': profileData.id })
      .whereIn('followers.sender_id', followers.map(follower => follower.id))
      .select('users.id', 'users.username', 'users.email');

    const followersWithFollowMe = followersYouFollowBack.map(follower => ({
      id: follower.id,
      username: follower.username,
      email: follower.email,
      follow_me: true,
    }));

    const followersCount = await knex('followers')
      .where({ receiver_id: profileData.id })
      .count('sender_id as count')
      .first();

    const followingCount = await knex('followers')
      .where({ sender_id: profileData.id })
      .count('receiver_id as count')
      .first();

    const follow = await knex('followers')
      .where({ sender_id: myProfile.id, receiver_id: profileData.id })
      .first();

    const followBack = await knex('followers')
      .where({ sender_id: profileData.id, receiver_id: myProfile.id })
      .first();

    profileData.isFollow = !!follow;
    profileData.followBack = followBack || null;
    profileData.followers = followersWithFollowMe;
    profileData.followersCount = followersCount.count || 0;
    profileData.followingCount = followingCount.count || 0;

    socket.emit('profile', {
      type: 'profile',
      user: profileData,
      success: true,
      noMessageError: true,
      message: '202',
    });

    return profileData;
  } catch (error) {
    console.log('error', error);
    return {};
  }
};

module.exports = { getUserProfile };
