const axios = require('axios');

// Função para obter resposta do bot usando a API do ChatGPT
async function obterRespostaDoBot(pergunta) {
  // Chave de API da OpenAI (substitua pela sua chave)
  const apiKey = 'sk-eionFWpNThMNy4eeFdC25789F60a4cC2A66b2c94D3948bA6';
  try {
    const resposta = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: pergunta }, { role: 'user', content: pergunta }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    return resposta.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao obter resposta do bot:', error.message);
    return 'Desculpe, ocorreu um erro ao processar sua pergunta.';
  }
}

const yeeIA = async mensagem => {
    const resposta = await obterRespostaDoBot(mensagem);
    return resposta
}

module.exports = { yeeIA }