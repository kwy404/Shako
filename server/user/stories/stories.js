// Função para publicar uma história
const publishStory = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
    const title = data.receive.title;
    const content = data.receive.content;
  
    if (token && title && content) {
      try {
        // Obtenha o usuário que está publicando a história com base no token
        const currentUser = await knex('users')
          .where({ token })
          .select('*')
          .first();
  
        if (!currentUser) {
          throw new Error('User not found');
        }
  
        // Crie a história na tabela de histórias
        const insertedStory = await knex('stories').insert({
          user_id: currentUser.id,
          title,
          content,
        });
  
        // Envie a história para todos os seguidores
        const followers = await knex('followers')
          .where({ sender_id: currentUser.id })
          .select('receiver_id');
  
        for (const follower of followers) {
          const followerUser = await knex('users')
            .where({ id: follower.receiver_id })
            .select('*')
            .first();
  
          sendToRoom(followerUser, 'stories', {
            type: 'story',
            userId: currentUser.id,
            success: true,
            noMessageError: true,
            story: {
              title,
              content,
              created_at: new Date().toISOString(),
            },
          }, io, socket);
  
          //Notification
          notification({ receiveUser: followerUser, user: currentUser, message: 'New story available.' }, knex, io, socket, sendToRoom, receive);
        }
  
        // Retorne algum sucesso ou mensagem, se necessário
        return 'Story published successfully';
      } catch (error) {
        // Tratar erros
        throw new Error('Failed to publish story');
      }
    }
  };
  
  module.exports = { publishStory };
  