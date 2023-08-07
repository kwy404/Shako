// Função para buscar usuários
const saveInteresses = async (data, knex, io, socket, sendToRoom, receive) => {
  try {
    const token = data.token; // O token fornecido no objeto data

    // Buscar o usuário com base no token
    const user = await knex('users').where('token', token).first();

    if (!user) {
      return;
    }

    const userId = user.id; // ID do usuário encontrado

    const interests = data.receive.selectedInterests; // Os interesses a serem salvos
    if (interests) {
      // Verificar e salvar os interesses não duplicados na tabela "interests"
      for (const interest of interests) {
        const existingInterest = await knex('interests')
          .where({ user_id: userId, name: interest.name })
          .first();

        if (!existingInterest) {
          await knex('interests').insert({
            user_id: userId,
            name: interest.name,
            category: interest.name,
            popularity: interest.popularity,
          });
        }
      }

      socket.emit('saveInteresses', {
        success: true,
        noMessageError: true,
        interesses: interests,
      });
    }
  } catch (error) {
    console.error('Erro ao salvar interesses:', error);
  }
};

module.exports = { saveInteresses };