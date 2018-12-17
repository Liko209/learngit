/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-15 13:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { MyState, Raw, State } from '../../models';

class StateAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/state';
  static saveStatePartial(id: number, state: Partial<State>) {
    return this.glipNetworkClient.put<Raw<MyState>>(
      `/save_state_partial/${id}`,
      state,
    );
  }
}

export default StateAPI;
