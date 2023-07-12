function calcularIncrementoExp(acao) {
    var incrementoExp = 0;
  
    switch (acao) {
      case 'postagem':
        incrementoExp = 50;
        break;
      case 'curtida':
        incrementoExp = 10;
        break;
      case 'comentario':
        incrementoExp = 5;
        break;
      case 'compartilhamento':
        incrementoExp = 20;
        break;
        // Adicione mais casos para outras ações, se necessário
      default:
        incrementoExp = 0;
        break;
    }
  
    return incrementoExp;
  }
  
  function calcularExpProximoNivel(level) {
    // Constantes
    var pi = Math.PI;
    var aceleracaoGravitacional = 9.8; // m/s^2
  
    // Parâmetros da fórmula
    var massaObjeto = 10; // kg
    var alturaInicial = 5; // metros
  
    // Cálculo do tempo de queda usando a fórmula da física
    var tempoQueda = Math.sqrt((2 * alturaInicial) / aceleracaoGravitacional);
  
    // Cálculo do raio do círculo usando o número pi
    var raioCirculo = level * pi;
  
    // Cálculo da área do círculo usando a fórmula matemática
    var areaCirculo = pi * Math.pow(raioCirculo, 2);
  
    // Cálculo do EXP necessário baseado na área do círculo e na massa do objeto
    var expProximoNivel = areaCirculo * massaObjeto * tempoQueda;
  
    return `${Math.round(expProximoNivel, 1)}`;
  }
  
  module.exports = {
    calcularExpProximoNivel,
    calcularIncrementoExp
  }