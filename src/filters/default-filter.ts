import {
  AnyObject,
  Filter,
  FilterBuilder,
  JsonSchema,
  Model,
  Where,
  WhereBuilder,
} from '@loopback/repository';
import {getJsonSchema} from '@loopback/repository-json-schema';
import {clone} from 'lodash';

export abstract class DefaultFilter<
  MT extends object = AnyObject
  > extends FilterBuilder<MT> {
  defaultWhere: Where<MT> | null | undefined;
  constructor(f?: Filter<MT>) {
    super(f);
    const dFilter = this.defaultFilter();
    this.defaultWhere = dFilter ? clone(dFilter.filter.where) : null;
    this.filter.where = {};
  }

  protected defaultFilter(): DefaultFilter<MT> | void { }

  isActive(modelCtor: typeof Model) {
    this.filter.where = new WhereBuilder<{is_active: boolean}>(
      this.filter.where,
    )
      .eq('is_active', true)
      //.and({is_active: true}) //also an option
      .build() as Where<MT>;
    this.isActiveRelations(modelCtor);
    return this;
  }

  isActiveRelations(modelCtor: typeof Model) {
    const relations: string[] = Object.keys(modelCtor.definition.relations);

    if (!relations.length) {
      return this;
    }

    const schema = getJsonSchema(modelCtor);
    //console.log("SCHEMA", schema);

    const relationsFiltered = relations.filter((r) => {
      const jsonSchema = schema.properties?.[r] as JsonSchema;
      if (
        !jsonSchema ||
        (jsonSchema.type !== 'array' && jsonSchema.type !== 'object')
      ) {
        return false;
      }

      const properties =
        (jsonSchema.items as any).properties || jsonSchema.properties;

      return Object.keys(properties).includes('is_active');
    });

    const whereStr = JSON.stringify(this.filter.where);

    //  (categories.*|relation2.*|relation3.*)
    const regex = new RegExp(
      `(${relationsFiltered.map((r) => `${r}.*`).join('|')})`,
      'g',
    );

    const matches = whereStr.match(regex);
    if (!matches) {
      return this;
    }

    const fields = matches.map((m) => {
      const r = m.split('.')[0]; //categories
      return {[`${r}.is_active`]: true};
    });

    this.filter.where = new WhereBuilder<{is_active: boolean}>(
      this.filter.where,
    )
      .and(fields)
      .build() as Where<MT>;
    return this;
  }

  build() {
    return this.defaultWhere
      ? this.impose(this.defaultWhere).filter
      : this.filter;
  }
}

// SCHEMA {
//   title: 'Genre',
//   type: 'object',
//   properties: {
//     id: { type: 'string' },
//     name: { type: 'string', minLength: 1, maxLength: 255 },
//     is_active: { type: 'boolean' },
//     created_at: { type: 'string', format: 'date-time' },
//     updated_at: { type: 'string', format: 'date-time' },
//     categories: { type: 'array', items: [Object], uniqueItems: true }
//   },
//   required: [ 'id', 'name', 'created_at', 'updated_at' ],
//   additionalProperties: true
// }
// CATEGORYFILTERBUILDER CategoryFilterBuilder {
//   filter: { where: {} },
//   defaultWhere: { is_active: true }
// }
// NEWFILTER {
//   where: { id: '1c7ae5ca-5718-4dd1-940d-f4e6a5072674', is_active: true }
// }
