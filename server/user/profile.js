const {calcularExpProximoNivel} = require('./exp');
const {validationTokenProfile} = require('../user/validationToken');


const getUserProfile = async (data, knex, io, socket, sendToRoom, receive) => {
    const token = data.token;
    const {username, discrimination} = data.receive;
    if(username && discrimination && token){
        knex('users').where({
          token: token
          }).select('*').then(async function(myProfile) {
            if(myProfile.length > 0){
              if(myProfile[0].id){
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
                    if(rows[0].banned == 1){
                      io.emit('profile', {
                        type: "profile",
                        user: rows[0],
                        success: false,
                        noMessageError: true,
                        message: "This account is banned from Shako. "
                      })
                      return {};
                    } else if(rows[0].private == 1){
                      if(`${myProfile[0].username}#${myProfile[0].discrimination}` != `${rows[0].username}#${rows[0].discrimination}`){
                        io.emit('profile', {
                          type: "profile",
                          user: rows[0],
                          success: false,
                          noMessageError: true,
                          message: "This account is private, both have to be followers. "
                        })
                        return {};
                      }
                    }
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
                      message: "This account doesn’t exist."
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
                      message: "This account doesn’t exist."
                  })
                  return {};
                  console.log(error)
                }
              }
              } else{
                  return {}
              }
        })
      }
  };
  
  module.exports = { getUserProfile };
  