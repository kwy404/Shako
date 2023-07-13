const banUser = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
    const userId = data.receive.id;
    if(token && userId){
        try {
            const admin = await knex('users')
              .where({ token: token, admin: '1' })
              .select('*')
              .first();
        
            if (admin == 0) {
              io.emit('profile', {
                  type: "profileBanned",
                  user: userId,
                  success: false,
                  noMessageError: false,
                  message: "Unauthorized access.",
                  redirect: false,
                  redirectUrl: "/",
                })
              return;
            }
        
            const user = await knex('users')
              .where({ id: userId })
              .select('*')
              .first();
        
            if (!user) {
              io.emit('profile', {
                type: "profileBanned",
                user: userId,
                success: false,
                noMessageError: false,
                message: "User not found.",
                redirect: false,
                redirectUrl: "/",
              })
              return;
            }
        
            if (user.banned == 1) {
              // Unban the user
              await knex('users')
                .where({ id: userId })
                .update({ banned: '0' });
      
              io.emit('profile', {
                  type: "profileBanned",
                  user: userId,
                  success: true,
                  noMessageError: true,
                  message: "User has been unbanned.",
                  redirect: false,
                  redirectUrl: "/",
                  banned: '0'
              })
              sendToRoom(`${user.token}-${user.token.id}`, 'profile', {
                type: "profileBanned",
                user: userId,
                success: true,
                noMessageError: true,
                message: "User has been unbanned.",
                redirect: false,
                redirectUrl: "/",
                banned: '0'
                }, io, socket)
            } else {
              // Ban the user
              await knex('users')
                .where({ id: userId })
                .update({ banned: '1' });
      
              io.emit('profile', {
                  type: "profileBanned",
                  user: userId,
                  success: true,
                  noMessageError: true,
                  message: "User has been banned.",
                  redirect: false,
                  redirectUrl: "/",
                  banned: '1'
              })

              sendToRoom(`${user.token}-${user.token.id}`, 'profile', {
                type: "profileBanned",
                user: userId,
                success: true,
                noMessageError: true,
                message: "User has been banned.",
                redirect: false,
                redirectUrl: "/",
                banned: '1'
                }, io, socket)
              
            }
          } catch (error) {
            io.emit('profile', {
              type: "profileBanned",
              user: userId,
              success: false,
              noMessageError: true,
              message: "Error occurred.",
              redirect: false,
              redirectUrl: "/",
            })
          }
    }
  };
  
module.exports = {banUser}