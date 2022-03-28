import {Component} from '@loopback/core';
import {UpdateCastMemberRelationObserver, UpdateCategoryRelationObserver, UpdateGenreRelationObserver} from '../observers';

export class EntityComponent implements Component {
  lifeCycleObservers = [
    UpdateCategoryRelationObserver,
    UpdateCastMemberRelationObserver,
    UpdateGenreRelationObserver
  ];


}
