/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-18 08:53:15
 * Copyright © RingCentral. All rights reserved.
 */
import StateAPI from '../state';

jest.mock('../../api');

describe('StateAPI', () => {
  describe('saveStatePartial()', () => {
    it('glipNetworkClient put() should be called with specific path', () => {
      StateAPI.saveStatePartial(7, { id: 7 });
      expect(StateAPI.glipNetworkClient.put)
        .toHaveBeenCalledWith({path: '/save_state_partial/7', data:{ id: 7 }});
    });
  });
});
