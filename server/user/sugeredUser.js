// Função para sugestão de usuários com base em preferências
const suggestedUsers = async (data, knex, io, socket, sendToRoom, receive) => {
  const token = data.token;

  try {
    const myProfile = await knex('users')
      .select('id')
      .where('token', token)
      .first();

    if (!myProfile) {
      return;
    }

    const myId = myProfile.id; // Obtenha o ID do seu perfil

    const myInterests = await knex('interests')
      .select('category')
      .where('user_id', myId);

    if (myInterests.length === 0) {
      // Caso não tenha interesses definidos, retornar usuários aleatórios
      const randomUsers = await knex('users')
        .select('username', 'discrimination', 'nivel', 'lumis', 'epic', 'verificado', 'admin', 'avatar', 'id', 'banner')
        .limit(10)
        .whereNot('id', myId)
        .orderByRaw('RAND()')
        .orderBy('admin', 'desc')
        .orderBy('verificado', 'desc')
        .orderBy('nivel', 'desc')
        .orderBy('lumis', 'desc');

      const count = randomUsers.length; // Contagem de resultados

      socket.emit('suggestedUsers', {
        type: 'suggestedUsers',
        users: randomUsers,
        count: count, // Inclui a contagem nos resultados
        success: false,
        noMessageError: true,
        message: "I found this."
      });
    } else {
      // Caso tenha interesses definidos, retornar usuários com interesses semelhantes
      let suggestedUsers = await knex('users AS u')
        .select('u.username', 'u.discrimination', 'u.nivel', 'u.lumis', 'u.epic', 'u.verificado', 'u.admin', 'u.avatar', 'u.id', 'u.banner')
        .distinct()
        .leftJoin('interests AS i', 'u.id', 'i.user_id')
        .whereIn('i.category', myInterests.map(interest => interest.category))
        .whereNot('u.id', myId)
        .limit(10)
        .orderByRaw('RAND()')
        .orderBy('u.admin', 'desc')
        .orderBy('u.verificado', 'desc')
        .orderBy('u.nivel', 'desc')
        .orderBy('u.lumis', 'desc');

      const count = suggestedUsers.length; // Contagem de resultados

      // Obter outros usuários sugeridos aleatoriamente, excluindo aqueles já encontrados
      const otherUsersSuggest = await knex('users AS u')
        .select('u.username', 'u.discrimination', 'u.nivel', 'u.lumis', 'u.epic', 'u.verificado', 'u.admin', 'u.avatar', 'u.id', 'u.banner')
        .distinct()
        .whereNot('u.id', myId)
        .whereNotIn('u.id', suggestedUsers.map(user => user.id)) // Excluir usuários já sugeridos
        .limit(10 - suggestedUsers.length) // Limitar para completar 10 usuários no total
        .orderByRaw('RAND()')
        .orderBy('u.admin', 'desc')
        .orderBy('u.verificado', 'desc')
        .orderBy('u.nivel', 'desc')
        .orderBy('u.lumis', 'desc');

      // Combinar as listas de usuários sugeridos
      suggestedUsers = suggestedUsers.concat(otherUsersSuggest);

      socket.emit('suggestedUsers', {
          type: 'suggestedUsers',
          users: suggestedUsers,
          count: count, // Inclui a contagem nos resultados
          success: false,
          noMessageError: true,
          message: "I found this."
      });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = { suggestedUsers };