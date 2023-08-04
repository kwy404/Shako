// Função para buscar usuários
const sendMessage = async (data, knex, io, socket, sendToRoom, receive) => {
    const username = data.receive.username;
    const token = data.token;
  
    knex('users').where({
      token: token
    }).select('*').then(async function (myProfile) {
      if (myProfile.length > 0) {
        const myId = myProfile[0].id; // Obtenha o ID do seu perfil
        
        if (username) {
          try {
            //Message here
          } catch (error) {
            console.error(error);
          } finally {
            // knex.destroy();
          }
        }
      }
    });
  };
  
  module.exports = { sendMessage };
  