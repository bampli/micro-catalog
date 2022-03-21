import {Entity, model, property} from '@loopback/repository';

export interface SmallCategory {
  id: string;
  name: string;
  is_active: boolean;
}

@model({settings: {strict: false}}) // metadata decorator
export class Category extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    // jsonSchema: {
    //   exists: ['Category', 'id']
    // }
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 1,
      maxLength: 255
    }
  })
  name: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      nullable: true
    },
    default: null
  })
  description: string;

  @property({
    type: 'boolean',
    required: false,
    default: true
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_active: boolean;

  @property({
    type: 'date',
    required: true,
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at: string; // ISO 8601 YYYY-MM-DDT00:00:00

  @property({
    type: 'date',
    required: true,
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updated_at: string; // ISO 8601 YYYY-MM-DDT00:00:00

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;

// #powered by ajv
// import {getModelSchemaRef} from '@loopback/rest';
// const schema = getModelSchemaRef(Category, {
//   title: 'NewCategory',
//   partial: true
// })
// console.dir(schema, {depth: 8});

// {
//   '$ref': '#/components/schemas/NewCategory',
//   definitions: {
//     NewCategory: {
//       title: 'NewCategory',
//       type: 'object',
//       description: "(tsType: Category, schemaOptions: { title: 'NewCategory' })",
//       properties: {
//         id: { type: 'string' },
//         name: { type: 'string' },
//         description: { type: 'string' },
//         is_active: { type: 'boolean' },
//         created_at: { type: 'string', format: 'date-time' },
//         updated_at: { type: 'string', format: 'date-time' }
//       },
//       required: [ 'id', 'name', 'created_at', 'updated_at' ],
//       additionalProperties: true,
//       'x-typescript-type': 'Category'
//     }
//   }
// }
