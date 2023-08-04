// Função para buscar usuários
const searchUsers = async (data, knex, io, socket, sendToRoom, receive) => {
    const username = data.receive.username;
    const token = data.token;
    const type = data.receive.typeSearch;
  
    knex('users').where({
      token: token
    }).select('*').then(async function (myProfile) {
      if (myProfile.length > 0) {
        const myId = myProfile[0].id; // Obtenha o ID do seu perfil
  
        if (username) {
          try {
            // Search users if its admin on top
            const users = await knex('users')
              .select('username', 'discrimination', 'nivel', 'lumis', 'epic', 'verificado', 'admin', 'avatar', 'id')
              .limit('10')
              .where('username', 'like', `%${username}%`)
              .whereNot('id', myId) // Exclua o seu perfil da lista
              .orderBy('admin', 'desc')
              .orderBy('discrimination', 'asc')
              .orderBy('verificado', 'desc')
              .orderBy('nivel', 'desc')
              .orderBy('lumis', 'desc');
  
            const count = users.length; // Contagem de resultados

            socket.emit('search', {
              type: type,
              users: users,
              count: count, // Inclui a contagem nos resultados
              success: false,
              noMessageError: true,
              message: "I found this."
            });
          } catch (error) {
            console.error(error);
          } finally {
            // knex.destroy();
          }
        }
      }
    });
  };
  
  module.exports = { searchUsers };
  