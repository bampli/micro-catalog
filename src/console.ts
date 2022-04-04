import * as commands from './commands';
import {default as chalk} from 'chalk';

console.log(chalk.green(process.argv));

const command = process.argv[2] || null;

if (!command) {
  showAvailableCommands()
}
const commandKey: string | undefined = Object.keys(commands).find(
  (c) => (commands as any)[c].command === command,
)!;   // '!' to assure that it is not 'undefined'

if (!commandKey) {
  showAvailableCommands()
};

console.log(commandKey);

// exec
const commandInstance = new (commands as any)[commandKey];

commandInstance
  .run()
  .catch(console.error);

//console.dir(error, {depth: 5}); // show error stack deeply

function showAvailableCommands() {
  console.log(chalk.green('Loopback Console'));
  console.log();
  console.log(chalk.green('Available Commands:'));
  console.log();
  for (const c of Object.keys(commands)) {
    console.log(
      `- ${chalk.green((commands as any)[c].command)}: ${(commands as any)[c].description
      }`,
    )
  }
  console.log();
  process.exit();
}
