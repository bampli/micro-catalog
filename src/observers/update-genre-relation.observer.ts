import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {GenreRepository} from '../repositories';


/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class UpdateGenreRelationObserver implements LifeCycleObserver {

  constructor(
    @repository(GenreRepository) private genreRepo: GenreRepository,
  ) { }

  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    this.genreRepo.modelClass.observe(
      'after save',
      async ({where, data, isNewInstance, ...other}) => {
        if (isNewInstance) {
          return;
        }
      })
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
