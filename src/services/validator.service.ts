import {bind, /* inject, */ BindingScope, inject} from '@loopback/core';
//import {repository} from "@loopback/repository";
//import {CategoryRepository} from "../repositories";
import {AjvFactory, getModelSchemaRef, RestBindings, validateRequestBody} from '@loopback/rest';

interface ValidateOptions<T> {
  data: any;
  entityClass: Function & {prototype: T};
}
@bind({scope: BindingScope.SINGLETON})
export class ValidatorService {

  cache = new Map();

  constructor(
    //@repository(CategoryRepository) private repo: CategoryRepository,
    @inject(RestBindings.AJV_FACTORY) private ajvFactory: AjvFactory
  ) { }

  async validate<T extends object>({data, entityClass}: ValidateOptions<T>) {
    const modelSchema = getModelSchemaRef(entityClass);
    if (!modelSchema) {
      const error = new Error('The parameter entityClass is not a entity');
      error.name = 'NotEntityClass';
      throw error;
    }
    const schemaRef = {$ref: modelSchema.$ref}; //WeakMap key value (loosely connected)
    const schemaName = Object.keys(modelSchema.definitions)[0];
    if (!this.cache.has(schemaName)) {
      this.cache.set(schemaName, modelSchema.definitions[schemaName]);
    }

    const globalSchemas = Array.from(this.cache).reduce<any>(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj
      },
      {}
    );
    // console.log("MODELSCHEMA");
    // console.dir(modelSchema, {depth: 8});
    // console.log("SCHEMANAME", schemaName);
    // console.log("SCHEMAREF", schemaRef);
    // console.log("GLOBALSCHEMAS");
    // console.dir(globalSchemas, {depth: 8});

    await validateRequestBody(
      {value: data, schema: schemaRef},
      {required: true, content: {}},
      globalSchemas,
      {
        ajvFactory: this.ajvFactory
      }
    );
  }
}

// globalSchemas
// [
    //   [key, value],
    //   [key, value],
    //   [key, value],
    // ]
    // reduced to:
    // {
    //   key: value,
    //   key: value,
    //   key: value,
    // }
    // {Category: schema-definitions, Genre: schema-definitions, ...}

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
