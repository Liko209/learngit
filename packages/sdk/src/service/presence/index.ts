import BaseService from '../../service/BaseService';
import handleData from './handleData';
import { SOCKET } from '../eventKey';

export interface Ipresence {
  id: number;
}

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
    this.caches = {}; // when serviceManager's property "instances" is recycled, it will be destroyed.
  }

  saveToMemory(presences: Ipresence[]): void {
    presences.forEach((presence: Ipresence) => {
      this.caches[presence.id] = presence;
    });
  }

  getById(id: number) {
    return Promise.resolve(this.caches[id]);
  }
}
