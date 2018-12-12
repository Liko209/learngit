/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 21:33:16
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '../Group';
import { Group } from 'sdk/models';

describe('GroupModel', () => {
  describe('isThePersonGuest()', () => {
    it('should return result base on whether person company is in guest_user_company_ids', () => {
      const personA = { id: 10, company_id: 1 };
      const personB = { id: 10, company_id: 4 };
      const gm = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [1, 2, 3],
      } as Group);
      expect(gm.isThePersonGuest(personA.company_id)).toBeTruthy;
      expect(gm.isThePersonGuest(personB.company_id)).toBeFalsy;
    });
  });
});
