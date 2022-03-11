export class FixtureCommand {
  static command = 'fixtures';
  static description = 'fixture description';

  async run() {
    console.log('fixture executing');
    throw new Error('test');
  };
}
