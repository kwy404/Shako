const { exec } = require('child_process');
const util = require('util');

const asyncExec = util.promisify(exec);

class CommandRunner {
  constructor(commands) {
    this.commands = commands;
  }

  async runCommand(command, description) {
    try {
      console.log(`Iniciando: ${description}`);
      const { stdout, stderr } = await asyncExec(command);
      console.log(`Concluído: ${description}`);
      console.log(`Saída do comando ${description}:`);
      console.log(stdout);
    } catch (error) {
      console.error(`Erro ao executar o comando ${description}:`);
      console.error(error.message);
    }
  }

  async runAllCommands() {
    for (const [command, description] of this.commands) {
      await this.runCommand(command, description);
    }
  }
}

const commandsToRun = [
  ['npm run app', 'Serviço App'],
  ['npm run dashboard', 'Serviço Dashboard'],
  ['npm run photo', 'Serviço Photo'],
  ['npm run spotify', 'Serviço Spotify']
];

const commandRunner = new CommandRunner(commandsToRun);
commandRunner.runAllCommands();