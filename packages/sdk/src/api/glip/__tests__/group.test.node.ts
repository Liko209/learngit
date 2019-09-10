/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import GroupAPI from '../group';
import Api from '../../api';

jest.mock('../../api');
jest.mock('foundation/network');

describe('GroupAPI', () => {
  describe('requestGroupById()', () => {
    it('glipNetworkClient getDataById() should be called with specific path', () => {
      GroupAPI.requestGroupById(3);
      expect(Api.getDataById).toHaveBeenCalledWith(3);
    });
  });
  describe('requestNewGroup()', () => {
    it('glipNetworkClient postData() should be called with specific data', () => {
      GroupAPI.requestNewGroup({ members: [12344235] });
      expect(Api.postData).toHaveBeenCalledWith({ members: [12344235] });
    });
  });
  describe('pinPost()', () => {
    it('pinPost() has different api, because team and group have different path', () => {
      GroupAPI.pinPost('team/123', { is_team: true, pin_post_ids: [] });
      expect(GroupAPI.glipNetworkClient.put).toHaveBeenCalledWith({
        path: 'team/123',
        data: { is_team: true, pin_post_ids: [] },
      });
    });
  });
  describe('addTeamMembers()', () => {
    it('glipNetworkClient addTeamMembers() should be called with specific data', () => {
      GroupAPI.addTeamMembers(2, [1, 2, 3]);
      expect(GroupAPI.glipNetworkClient.put).toHaveBeenCalledWith({
        path: '/add_team_members/2',
        data: { members: [1, 2, 3] },
      });
    });
  });
  describe('createTeam()', () => {
    it('glipNetworkClient createTeam() should be called with specific data', () => {
      const data = {
        set_abbreviation: 'NEW TEAM',
        description: 'SOME DESC',
        privacy: 'protected',
        permissions: {
          admin: {
            uids: [23776043011],
          },
          user: {
            uids: [],
            level: 15,
          },
        },
        members: [22103719939, 23776043011],
        surrogates: [],
        creator_id: 23776043011,
        version: 1670941910740196,
        model_size: 0,
        is_new: true,
        is_team: true,
        is_public: false,
        email_friendly_abbreviation: 'new_team',
        new_version: 1670941910740196,
        request_id: 13,
        _csrf: null,
      };
      GroupAPI.createTeam(data);
      expect(GroupAPI.glipNetworkClient.post).toHaveBeenCalledWith({
        data,
        path: '/team',
      });
    });
  });
  describe('sendTypingEvent', () => {
    it('should send when socket is not undefined', () => {
      GroupAPI.sendTypingEvent({});
      expect(GroupAPI.glipNetworkClient.send).toHaveBeenCalled();
    });
  });
});
