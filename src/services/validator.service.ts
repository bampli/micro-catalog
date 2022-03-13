import {bind, /* inject, */ BindingScope, inject} from '@loopback/core';
import {Entity, repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {AjvFactory, getModelSchemaRef, RestBindings, validateRequestBody} from '@loopback/rest';

interface ValidateOptions<T> {
  data: any;
  entityClass: Function & {prototype: T};
}
@bind({scope: BindingScope.SINGLETON})
export class ValidatorService {
  constructor(
    @repository(CategoryRepository) private repo: CategoryRepository,
    @inject(RestBindings.AJV_FACTORY) private ajvFactory: AjvFactory
  ) { }

  async validate<T extends object>({data, entityClass}: ValidateOptions<T>) {
    const modelSchema = getModelSchemaRef(entityClass);
    const schemaRef = {$ref: modelSchema.$ref}; //WeakMap key value (loosely connected)
    await validateRequestBody(
      {value: data, schema: schemaRef},
      {required: true, content: {}},
      modelSchema.definitions,
      {
        ajvFactory: this.ajvFactory
      }
    );
  }
}
