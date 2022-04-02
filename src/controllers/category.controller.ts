import {
  Count,
  CountSchema,
  EntityNotFoundError,
  Filter,
  FilterBuilder,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  response,
} from '@loopback/rest';
import {CategoryFilterBuilder} from '../filters/category.filter';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';
import {PaginatorSerializer} from '../utils/paginator';

export class CategoryController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) { }

  @get('/categories/count')
  @response(200, {
    description: 'Category model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Category) where?: Where<Category>,
  ): Promise<Count> {
    return this.categoryRepository.count(where);
  }

  @get('/categories')
  @response(200, {
    description: 'Array of Category model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Category, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Category) filter?: Filter<Category>,
  ): Promise<PaginatorSerializer<Category>> {
    const newFilter = new CategoryFilterBuilder(filter).build();
    return this.categoryRepository.paginate(newFilter);
  }

  @get('/categories/{id}')
  @response(200, {
    description: 'Category model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Category, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Category) filter?: Filter<Category>
  ): Promise<Category> {
    const newFilter = new CategoryFilterBuilder(filter)
      .where({
        id,
      })
      .build();
    console.log("NEWFILTER");
    console.dir(newFilter, {depth: 4});
    const obj = await this.categoryRepository.findOne(newFilter);

    if (!obj) {
      throw new EntityNotFoundError(Category, id);
    }

    return obj;
  }
}

// NEWFILTER {
//   where: { id: '1c7ae5ca-5718-4dd1-940d-f4e6a5072674', is_active: true }
// }

