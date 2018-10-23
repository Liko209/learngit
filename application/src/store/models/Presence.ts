import { observable, action } from 'mobx';
import { Presence } from 'sdk/models';
import Base from './Base';

export default class PresenceModel extends Base<Presence> {
  @observable
  presence?: Presence['presence'];

  constructor(data: Presence) {
    super(data);
    const { presence } = data;

    this.presence = presence;
  }

  @action
  reset() {
    this.presence = 'NotReady';
  }

  static fromJS(data: Presence) {
    return new PresenceModel(data);
  }
}
