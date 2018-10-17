import { observable } from 'mobx';
import { Presence } from 'sdk/models';
import Base from './Base';

export default class PresenceModel extends Base<Presence> {
  @observable
  presence?:
    | 'Unavailable'
    | 'Available'
    | 'OnCall'
    | 'DND'
    | 'not_ready'
    | 'InMeeting';

  constructor(data: Presence) {
    super(data);
    const { presence } = data;

    this.presence = presence;
  }

  static fromJS(data: Presence) {
    return new PresenceModel(data);
  }
}
