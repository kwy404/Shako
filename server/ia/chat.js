const axios = require('axios');

// Função para obter resposta do bot usando a API do ChatGPT
async function obterRespostaDoBot(pergunta) {
  // Chave de API da OpenAI (substitua pela sua chave)
  const apiKey = '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';

  try {
    const resposta = await axios.post(
      'https://api.openai.com/v1/engines/gpt-3.5-turbo/completions',
      {
        prompt: pergunta,
        max_tokens: 50 // Número de tokens máximos de resposta
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    return resposta.data.choices[0].text.trim();
    
    } catch(error){
      console.error('Erro ao obter resposta do bot:', error.message);
      return 'Desculpe, ocorreu um erro ao processar sua pergunta.';
    }
}

const yeeIA = async mensagem => {
    const resposta = await obterRespostaDoBot(mensagem);
    return resposta
}

module.exports = { yeeIA }