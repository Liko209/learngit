/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-15 13:40:00
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';

import { Raw } from '../../framework/model';
import { State, MyState } from '../../module/state/entity';

class StateAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/state';
  static saveStatePartial(id: number, state: Partial<State>) {
    return StateAPI.glipNetworkClient.put<Raw<MyState>>({
      path: `/save_state_partial/${id}`,
      data: state,
    });
  }
}

export default StateAPI;
