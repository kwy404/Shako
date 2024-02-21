const axios = require('axios');

const apiKey = process.env.OPENAI_KEY || "9022";

async function obterRespostaDoBot(mensagem) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      messages: [{ role: "system", content: mensagem}],
      model: "gpt-3.5-turbo",
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0];
  } catch (error) {
    return "Desculpe, estou tendo problemas para entender."
  }
}

const yeeIA = async mensagem => {
    const resposta = await obterRespostaDoBot(mensagem);
    return resposta
}

module.exports = { yeeIA }