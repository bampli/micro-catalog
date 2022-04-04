import {
  Count,
  CountSchema,
  EntityNotFoundError,
  Filter,
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
//import {Genre} from '../models';
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
    const newFilter = new CategoryFilterBuilder({
      ...filter,
      // order: ['_score DESC', '_name DESC'],
      // where: {
      //   ['fuzzy' as any]: {
      //     // name: {
      //     query: 'FloralWhire',
      //     fields: ['name', 'description'],
      //     // fuzziness: 'auto',
      //     //},
      //   }
      // }
    }).build();
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

    // console.log("CATEGORYFILTERBUILDER")
    // console.dir(new CategoryFilterBuilder({
    //   where: {
    //     //@ts-ignore
    //     'categories.name': 'x'
    //   },
    // }).isActiveRelations(Genre)
    //   .build(),
    //   {depth: 8}
    // );

    const newFilter = new CategoryFilterBuilder(filter)
      .where({
        id,
      })
      //.order(['name DESC'])   // ordering is also an option
      .build();
    //console.log("NEWFILTER", newFilter);
    const obj = await this.categoryRepository.findOne(newFilter);

    if (!obj) {
      throw new EntityNotFoundError(Category, id);
    }

    return obj;
  }
}

// CATEGORYFILTERBUILDER CategoryFilterBuilder {
//   filter: { where: {} },
//   defaultWhere: { 'categories.name': 'x', is_active: true }
// }

// NEWFILTER {
//   where: { id: '1c7ae5ca-5718-4dd1-940d-f4e6a5072674', is_active: true }
// }
