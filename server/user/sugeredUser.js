// Função para sugestão de usuários com base em preferências
const suggestedUsers = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
  
    knex('users').where({
      token: token
    }).select('*').then(async function (myProfile) {
      if (myProfile.length > 0) {
        const myId = myProfile[0].id; // Obtenha o ID do seu perfil
  
        try {
          // Sugest users with preference criteria
          const users = await knex('users')
            .select('username', 'discrimination', 'nivel', 'lumis', 'epic', 'verificado', 'admin', 'avatar', 'id', 'banner')
            .limit('10')
            .whereNot('id', myId) // Exclua o seu perfil da lista
            .orderBy('admin', 'desc')
            .orderBy('discrimination', 'asc')
            .orderBy('verificado', 'desc')
            .orderBy('nivel', 'desc')
            .orderBy('lumis', 'desc');
  
          const count = users.length; // Contagem de resultados
  
          socket.emit('suggestedUsers', {
            type: 'suggestedUsers',
            users: users,
            count: count, // Inclui a contagem nos resultados
            success: false,
            noMessageError: true,
            message: "I found this."
          });
        } catch (error) {
          console.error(error);
        }
      }
    });
};
  
module.exports = { suggestedUsers };  