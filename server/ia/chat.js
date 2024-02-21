const OpenAI = require('openai');

const openai = new OpenAI();

async function obterRespostaDoBot(mensagem) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: mensagem }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0];
}

const yeeIA = async mensagem => {
    const resposta = await obterRespostaDoBot(mensagem);
    return resposta
}

module.exports = { yeeIA }