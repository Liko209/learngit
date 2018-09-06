/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-23 14:53:55
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager from '../../store';
import { getGroupName } from '../groupName';
import BasePresenter from '../../store/base/BasePresenter';
const personStore = {
  get: jest.fn(),
};
const basePresenter = new BasePresenter();
describe('getGroupName', () => {
  beforeAll(() => {
    storeManager.getEntityMapStore = jest.fn().mockReturnValue(personStore);
  });
  describe('team', () => {
    it('should return setAbbreviation of team', () => {
      expect(getGroupName(
        basePresenter.getEntity,
        {
          id: 1132,
          members: [1, 2, 3],
          description: 'llll',
          pinnedPostIds: [2, 3, 4],
          isTeam: true,
          setAbbreviation: 'aaa',
          dispose: () => { },
        },
      )).toBe('aaa');
    });

    it('should return setAbbreviation if no currentUserId provided', () => {
      expect(getGroupName(
        basePresenter.getEntity,
        {
          id: 1132,
          members: [1, 2, 3],
          description: 'llll',
          pinnedPostIds: [2, 3, 4],
          isTeam: false,
          setAbbreviation: 'aaa',
          dispose: () => { },
        },
      )).toBe('aaa');
    });
  });

  describe('me conversation name', () => {
    it('should return displayName + (me) if only current user in member list', () => {
      personStore.get.mockReturnValue({
        displayName: 'Jack',
      });
      expect(getGroupName(
        basePresenter.getEntity,
        {
          id: 1132,
          members: [1],
          description: 'llll',
          pinnedPostIds: [2, 3, 4],
          isTeam: false,
          setAbbreviation: 'aaa',
          dispose: () => { },
        },
        1),
      ).toBe('Jack (me)');
    });
  });

  describe('1:1 conversation', () => {
    it('should return displayName of the other member', () => {
      personStore.get.mockImplementation((id) => {
        if (id === 2) {
          return {
            displayName: 'Jack',
          };
        }
        return null;
      });

      expect(getGroupName(
        basePresenter.getEntity,
        {
          id: 1132,
          members: [1, 2],
          description: 'llll',
          pinnedPostIds: [2, 3, 4],
          isTeam: false,
          setAbbreviation: 'aaa',
          dispose: () => { },
        },
        1)).toBe('Jack');
    });
  });

  describe('group conversation', () => {
    it(
      `should return first name if user has first_name and last_name,
    last name if user has only last_name,
    email if user has neither first_name nor last_name,
    separated by comma, in right order`,
      () => {
        const people = {
          1: {
            id: 1,
            firstName: 'Chris',
            lastName: 'zhan',
          },
          2: {
            id: 2,
            firstName: 'Jeffrey',
            lastName: 'Huang',
          },
          3: {
            id: 3,
            firstName: 'Andy',
          },
          4: {
            id: 4,
            lastName: 'Hu',
          },
          5: {
            id: 5,
            email: 'lip.wang@ringcentral.com',
          },
          6: {
            id: 6,
            firstName: 'Shining',
            lastName: 'Miao',
          },
          7: {
            id: 7,
            firstName: '01david',
          },
          8: {
            id: 8,
            lastName: '+Casey',
          },
          9: {
            id: 9,
            email: '+chris.zhan@ringcentral.com',
          },
          10: {
            id: 10,
            email: '01david@rc.come',
          },
        };
        personStore.get.mockImplementation(id => people[id]);

        expect(getGroupName(
          basePresenter.getEntity,
          {
            id: 1132,
            members: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            description: 'llll',
            pinnedPostIds: [2, 3, 4],
            isTeam: false,
            setAbbreviation: 'aaa',
            dispose: () => { },
          },
          1)).toBe('Andy, Hu, Jeffrey, Shining, 01david, +Casey, lip.wang@ringcentral.com, 01david@rc.come, +chris.zhan@ringcentral.com');
      },
    );
  });
});
