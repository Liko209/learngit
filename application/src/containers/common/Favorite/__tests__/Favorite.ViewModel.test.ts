/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 15:22:58
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupService } from 'sdk/module/group';
import { ProfileService } from 'sdk/module/profile';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { getEntity, getGlobalValue } from '../../../../store/utils';
import { FavoriteViewModel } from '../Favorite.ViewModel';
import { FavoriteProps } from '../types';
import { GLOBAL_KEYS } from '../../../../store/constants';

jest.mock('../../../../store/utils');

const mockServiceGroup = {
  id: 11370502, // team or group id
};

const mockEntityGroup: any = {
  isFavorite: true,
  members: [],
};

const profileService = {
  markGroupAsFavorite: jest.fn().mockResolvedValue(ServiceCommonErrorType.NONE),
};

const groupService = {
  getLocalGroup: jest.fn().mockResolvedValue(mockServiceGroup),
};

GroupService.getInstance = jest.fn().mockReturnValue(groupService);
ProfileService.getInstance = jest.fn().mockReturnValue(profileService);

const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 1,
};

let props: FavoriteProps;
let vm: FavoriteViewModel;

describe('FavoriteViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    GroupService.getInstance = jest.fn().mockReturnValue(groupService);
    (getEntity as jest.Mock).mockReturnValue(mockEntityGroup);
    (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
      return mockGlobalValue[key];
    });
    props = { id: 11370502 }; // Note: Make sure that each instance is created the same
    vm = new FavoriteViewModel(props);
  });

  describe('getConversationId', () => {
    it('should be direct return a conversation id when it is the team id', () => {
      props.id = 2031622; // team id
      vm = new FavoriteViewModel(props);
      expect(vm.conversationId).toEqual(props.id);
    });

    it('should be direct return a conversation id when it is the group id', () => {
      props.id = 18751490; // group id
      vm = new FavoriteViewModel(props);
      expect(vm.conversationId).toEqual(props.id);
    });

    it('should be from service fetch a conversation id when it is the person id', async () => {
      props.id = 237571; // person id
      vm = new FavoriteViewModel(props);
      await vm.getConversationId(); // Note: You need to wait for asynchronous processing
      expect(vm.conversationId).toEqual(mockServiceGroup.id);
    });

    it('should be not available conversation id when it is the person id and 1:1 talk was never created', async () => {
      groupService.getLocalGroup = jest.fn().mockResolvedValue(undefined);
      GroupService.getInstance = jest.fn().mockReturnValue(groupService);
      props.id = 237571; // person id
      vm = new FavoriteViewModel(props);
      await vm.getConversationId(); // Note: You need to wait for asynchronous processing
      expect(vm.conversationId).toEqual(0);
    });

    it('should be undefined when other type id props are passed in', () => {
      props.id = 1; // other type id
      vm = new FavoriteViewModel(props);
      expect(vm.conversationId).toBeUndefined();
    });
  });

  describe('isFavorite', () => {
    it('should be true when favorite group', () => {
      mockEntityGroup.isFavorite = true;
      expect(vm.isFavorite).toEqual(true);
    });

    it('should be false when not favorite group', () => {
      mockEntityGroup.isFavorite = false;
      expect(vm.isFavorite).toEqual(false);
    });

    it('should be false when other type id props are passed in', () => {
      props.id = 1; // other type id
      vm = new FavoriteViewModel(props);
      expect(vm.isFavorite).toEqual(false);
    });
  });

  describe('isMember', () => {
    it('should be true when current user id in group', () => {
      mockEntityGroup.members = [1, 2, 3];
      expect(vm.isMember).toBe(true);
    });

    it('should be false when current user id not in group', () => {
      mockEntityGroup.members = [2, 3];
      expect(vm.isMember).toBe(false);
    });

    it('should be false when other type id props are passed in', () => {
      props.id = 1; // other type id
      vm = new FavoriteViewModel(props);
      expect(vm.isMember).toEqual(false);
    });
  });

  describe('handlerFavorite', () => {
    it('should be success when request service for handler favorite is success', async () => {
      profileService.markGroupAsFavorite = jest
        .fn()
        .mockResolvedValue(ServiceCommonErrorType.NONE);
      GroupService.getInstance = jest.fn().mockReturnValue(groupService);
      const result = await vm.handlerFavorite();
      expect(result).toEqual(ServiceCommonErrorType.NONE);
    });

    it('should be throw a error when request service for handler favorite has error', async () => {
      profileService.markGroupAsFavorite = jest
        .fn()
        .mockResolvedValue(ServiceCommonErrorType.SERVER_ERROR);
      GroupService.getInstance = jest.fn().mockReturnValue(groupService);
      const result = await vm.handlerFavorite();
      expect(result).toEqual(ServiceCommonErrorType.SERVER_ERROR);
    });
  });
});
