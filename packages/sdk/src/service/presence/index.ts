import BaseService from '../../service/BaseService';
import handleData from './handleData';
import { SOCKET } from '../eventKey';
import { Presence } from '../../models';

export default class PresenceService extends BaseService {
  static key = 'PresenceService';

  public caches: object;

  constructor() {
    const subscriptions = {
      [SOCKET.PRESENCE]: (presence: any) => {
        handleData([].concat(presence));
      },
    };
    super(null, null, null, subscriptions);
    // when serviceManager's property "instances" is recycled, it will be destroyed.
    this.caches = {};
  }

  saveToMemory(presences: Presence[]): void {
    presences.forEach((presence: Presence) => {
      this.caches[presence.id] = presence;
    });
  }

  getById(id: number) {
    return Promise.resolve(this.caches[id]);
  }
}
