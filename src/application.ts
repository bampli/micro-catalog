import {BootMixin} from '@loopback/boot';
import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestComponent, RestServer} from '@loopback/rest';
import {RestExplorerBindings} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {EntityComponent, RestExplorerComponent, ValidatorsComponent} from './components';
import {MySequence} from './sequence';
import {RabbitmqServer} from './servers';

export {ApplicationConfig};

export class MicroCatalogApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(Application)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    options.rest.sequence = MySequence;

    this.component(RestComponent);
    const restServer = this.getSync<RestServer>('servers.RestServer');

    // Set up default home page
    restServer.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(ValidatorsComponent);
    this.component(EntityComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.server(RabbitmqServer);
    //this.component(CrudRestComponent);
  }

  // Intercept boot & test validator services, installed after super.boot
  async boot(): Promise<void> {
    await super.boot();

    // const categoryRepo = this.getSync('repositories.CategoryRepository');
    // // @ts-ignore
    // const category: Category[] = await categoryRepo.find({where: {id: '1-cat'}});

    // console.log("CATEGORY", category, category[0].id, category[0].name);
    // // @ts-ignore
    // categoryRepo.updateById(category[0].id, {
    //   ...category[0],
    //   name: 'ok2 loopback'
    // });

    // const genreRepo = this.getSync('repositories.GenreRepository');
    // //@ts-ignorets_
    // genreRepo.updateCategories({
    //   "id": "1d644412-0d3a-4d30-8757-29ca50a2047",
    //   "name": "MediumTurquoise2",
    //   "is_active": true
    // });

    // const validator = this.getSync<ValidatorService>('services.ValidatorService');

    // console.log('BOOOOOOOOOOOOOOT');
    // try {
    //   await validator.validate({
    //     data: {
    //       id: '12',
    //       name: 'teste',
    //       created_at: "2020-01-01T00:00:00.000Z",
    //       updated_at: "2020-01-01T00:00:00.000Z"
    //     },
    //     entityClass: Category,
    //   })
    // } catch (e) {
    //   console.dir(e, {depth: 8});
    // }
  }
}
