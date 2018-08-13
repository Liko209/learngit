import { observable } from 'mobx';

export default class PresenceModel {
  id: number;
  @observable presence: string;

  constructor(model: IPresence) {
    const { id, presence } = model;

    this.id = id;
    this.presence = presence;
  }

  static fromJS(data: any) {
    return new PresenceModel(data);
  }

  dispose() {} // eslint-disable-line
}
