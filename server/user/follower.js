// Função para seguir ou parar de seguir um usuário
const followUser = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
    const userIdToFollow = data.receive.id;
    
    if (token && userIdToFollow) {
      try {
        const user = await knex('users')
        .where({ id: userIdToFollow })
        .first();
        // Obter o ID do usuário atual com base no token
        const currentUser = await knex('users')
          .where({ token: token })
          .select('id')
          .first();
  
        if (!currentUser) {
          throw new Error('User not found');
        }
  
        const currentUserId = currentUser.id;
  
        // Verifica se o usuário já está sendo seguido
        const existingFollow = await knex('followers')
          .where({ sender_id: currentUserId, receiver_id: userIdToFollow })
          .select('*')
          .first();
  
        if (existingFollow) {
          // O usuário já está sendo seguido, então vamos parar de seguir
          await knex('followers')
            .where({ sender_id: currentUserId, receiver_id: userIdToFollow })
            .del();
        
            io.emit('profile', {
                type: "follower",
                user: userIdToFollow,
                success: true,
                noMessageError: true,
                message: "User has been unfollow.",
                follow: '0'
            })
            
            sendToRoom(`${user.token}-${user.token}`, 'profile', {
                type: "follower",
                user: {'username': currentUser.usename},
                success: true,
                noMessageError: true,
                message: "Unfollow you.",
                follow: '0'
            }, io, socket)

          return; // Retorna para evitar a inserção do registro novamente
        }
  
        // Cria um novo registro na tabela de seguidores
        await knex('followers').insert({
          sender_id: currentUserId,
          receiver_id: userIdToFollow,
        });

        io.emit('profile', {
            type: "follower",
            user: userIdToFollow,
            success: true,
            noMessageError: true,
            message: "User has follow.",
            follow: '1'
        })
        
        sendToRoom(`${user.token}-${user.token}`, 'profile', {
          type: "follower",
          user: {'username': currentUser.usename},
          success: true,
          noMessageError: true,
          message: "Follow you.",
          follow: '1'
          }, io, socket)
  
        // Aqui você pode adicionar qualquer lógica adicional que desejar, como enviar notificações, atualizar contadores, etc.
  
      } catch (error) {
        // Tratar erros
        console.error(error);
        throw new Error('Failed to follow/unfollow user');
      }
    }
  };
  
  module.exports = { followUser };
  