import { IEntity } from './../store.d';
import { observable } from 'mobx';
import { Presence } from 'sdk/models';

export default class PresenceModel implements IEntity {
  id: number;
  @observable presence?: 'default' | 'offline' | 'online' | 'away';

  constructor(data: Presence) {
    const { id, presence } = data;

    this.id = id;
    this.presence = presence;
  }

  static fromJS(data: Presence) {
    return new PresenceModel(data);
  }

  dispose() { }
}
