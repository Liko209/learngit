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
  describe('canPost', () => {
    it('should return true when the group is not term', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: false,
      } as Group);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is admin', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(true);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is not admin and permissions is undefined', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: undefined,
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is not admin and permissions.user is undefined', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: {
          user: undefined,
        },
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is not admin and permissions.user.level is 0', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: {
          user: {
            level: 0,
          },
        },
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeFalsy();
    });
    it('should return true when the group is term and current user is not admin and permissions.user.level is 13', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: {
          user: {
            level: 13,
          },
        },
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeTruthy();
    });
  });
});
