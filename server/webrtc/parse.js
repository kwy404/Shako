const {userRegister} = require('../user/register');
const {userLogin} = require('../user/login');
const {validationToken, userValidateCode} = require('../user/validationToken')

const parseMessage = async ({type, data}, ws, knex, app, io) => {
    try {
        if(type != 'validationToken' && type != 'userValidateCode'){
            await new types[type](data, knex, ws)
        } else{
            await types[type](data, knex, ws)
        }
    } catch (error) {
        //Pass, no code here
    }
};


// Types, like a class or a function
// You make right if its a class, if class its new types
const types = {
    'userRegister': userRegister,
    'userLogin': userLogin,
    'validationToken': validationToken,// Refactory this, maybe tomorrow
    'userValidateCode': userValidateCode // Refactory this, maybe tomorrow
};

module.exports = {parseMessage};