const {calcularExpProximoNivel} = require('./exp');

const getUserProfile = async (data, knex, io, socket, sendToRoom, receive) => {
    const {username, discrimination} = data.receive;
    if(username && discrimination){
        try {
            const rows = await knex('users').where({
              username: username,
              discrimination: discrimination
            }).select('*');
        
            if (rows.length > 0) {
              rows[0].password = undefined;
              rows[0].code_activate = undefined;
              rows[0].exp_to_next_level = calcularExpProximoNivel(rows[0].nivel + 1);
              rows[0].token = undefined;
        
              io.emit('profile', {
                type: "profile",
                user: rows[0],
                success: true,
                noMessageError: true,
                message: "202"
              })
              return rows[0];
            } else {
             io.emit('profile', {
                type: "profile",
                user: rows[0],
                success: false,
                noMessageError: true,
                message: "404"
              })
              return {};
            }
          } catch (error) {
            // Lida com erros de consulta ao banco de dados
            io.emit('profile', {
                type: "profile",
                user: rows[0],
                success: false,
                noMessageError: true,
                message: "404"
              })
            return {};
          }
    }
  };
  
  module.exports = { getUserProfile };
  