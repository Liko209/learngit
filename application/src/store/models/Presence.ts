import { observable, action } from 'mobx';
import { Presence } from 'sdk/module/presence/entity';
import Base from './Base';
import { PRESENCE } from 'sdk/module/presence/constant';

export default class PresenceModel extends Base<Presence> {
  @observable
  presence?: PRESENCE;

  constructor(data: Presence) {
    super(data);
    const { presence } = data;

    this.presence = presence;
  }

  @action
  reset() {
    this.presence = PRESENCE.NOTREADY;
  }

  static fromJS(data: Presence) {
    return new PresenceModel(data);
  }
}
