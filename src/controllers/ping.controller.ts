import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get, Request, response,
  ResponseObject, RestBindings
} from '@loopback/rest';
import {CategoryRepository} from '../repositories';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) { }

  @repository(CategoryRepository) private categoryRepo: CategoryRepository;

  // Map to `GET /ping`
  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }


  @get('/categories')
  async index() {
    await this.categoryRepo.create({
      id: '1',
      name: 'minah categoria',
      created_at: "2020-01-01T00:00",
      updated_at: "2020-01-01T00:01"
      //description: 'minha descrição'
    });
    return this.categoryRepo.find()
  }
}

// [
//   {
//       "id": "1",
//       "name": "minah categoria",
//       "is_active": true,
//       "created_at": "2022-02-27T15:15:53.741Z",
//       "updated_at": "2022-02-27T15:15:53.741Z",
//       "docType": "Category"
//   }
// ]

