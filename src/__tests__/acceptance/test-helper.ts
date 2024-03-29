import {Client, givenHttpServerConfig} from '@loopback/testlab';
import {MicroCatalogApplication} from '../..';
import config from '../../../config';
//import { supertest } from '@loopback/testlab';
import supertest from 'supertest';
import {Esv7DataSource} from '../../datasources';
import dbConfig from '../../datasources/esv7.datasource.config';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
    port: 9000,
  });

  const app = new MicroCatalogApplication({
    ...config,
    rest: restConfig,
  });

  await app.boot();

  app.bind('datasources.esv7').to(testDb);

  await app.start();

  const client = supertest('http://127.0.0.1:9000');

  return {app, client};
}

export const testDb = new Esv7DataSource({
  ...dbConfig,
  index: 'catalog-test',
});

export async function clearDb() {
  await testDb.deleteAllDocuments();
}

export interface AppWithClient {
  app: MicroCatalogApplication;
  client: Client;
}
