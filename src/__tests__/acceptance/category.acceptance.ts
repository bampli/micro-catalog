import {Client, expect} from '@loopback/testlab';
import {MicroCatalogApplication} from '../..';
import {clearDb, setupApplication} from './test-helper';

describe('HomePage', () => {
  let app: MicroCatalogApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  beforeEach(clearDb);    // repeat for each test

  after(async () => {
    await app.stop();
  });

  it('invokes and GET /categories', async () => {
    const response = await client.get('/categories').expect(200);
    expect(response.body).to.containDeep({
      results: [],
      count: 0
    });
  });

});
