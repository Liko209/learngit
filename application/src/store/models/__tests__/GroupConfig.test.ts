/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-27 10:13:32
 * Copyright © RingCentral. All rights reserved.
 */
import GroupConfigModel from '../GroupConfig';
import { GroupConfig } from 'sdk/models';

describe('GroupConfigModel', () => {
  describe('constructor', () => {
    it('should be undefined when there is not draft', () => {
      const model = GroupConfigModel.fromJS({
        id: 1,
      } as GroupConfig);
      expect(model.draft).toBe(undefined);
      expect(model.sendFailurePostIds).toBe(undefined);
    });

    it('should be undefined when there has draft value', () => {
      const model = GroupConfigModel.fromJS({
        id: 1,
        draft: 'text',
        send_failure_post_ids: [1, 2],
      } as GroupConfig);
      expect(model.draft).toEqual('text');
      expect(model.sendFailurePostIds).toEqual([1, 2]);
    });
  });
});
