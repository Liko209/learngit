/*
 * @Author: Andy Hu
 * @Date: 2018-12-07 14:47:58
 * Copyright © RingCentral. All rights reserved.
 */
jest.mock('sdk/service/state');
jest.mock('sdk/service/profile');
jest.mock('sdk/service/group');
jest.mock('@/history');
jest.mock('@/store');
jest.mock('@/store/handler/SectionGroupHandler');

import { GroupService } from 'sdk/service/group';
import { ProfileService } from 'sdk/service/profile';
import { StateService } from 'sdk/service/state';
import history from '@/history';
import storeManager from '@/store';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { MessageRouterChangeHelper } from '../helper';
import { GLOBAL_KEYS } from '@/store/constants';
let mockedStateService: any;
let mockedProfileService: any;
let mockedGroupService: any;
let mockedGlobalStore: any;
let mockedSectionHanlder: any;
function resetMockedServices() {
  mockedStateService = {
    lastGroupId: 110,
    async getMyState() {
      return { last_group_id: this.lastGroupId };
    },
  };
  mockedProfileService = {
    hidden: false,
    async isConversationHidden() {
      return this.hidden;
    },
    reopenConversation: jest.fn(),
  };
  mockedGroupService = {
    valid: true,
    group: {},
    async isValid() {
      return this.valid;
    },
    async getById() {
      return {};
    },
    updateGroupLastAccessedTime: jest.fn(),
  };
  mockedGlobalStore = {
    set: jest.fn(),
  };
  mockedSectionHanlder = {
    onReady: (callback: Function) => callback(),
  };
}

function mockDependencies() {
  SectionGroupHandler.getInstance = jest
    .fn()
    .mockImplementation(() => mockedSectionHanlder);
  StateService.getInstance = jest
    .fn()
    .mockImplementation(() => mockedStateService);
  GroupService.getInstance = jest
    .fn()
    .mockImplementation(() => mockedGroupService);
  ProfileService.getInstance = jest
    .fn()
    .mockImplementation(() => mockedProfileService);
  storeManager.getGlobalStore = jest
    .fn()
    .mockImplementation(() => mockedGlobalStore);
  history.push = jest.fn().mockImplementation(jest.fn());
  history.replace = jest.fn().mockImplementation(jest.fn());
}

describe('MessageRouterChangeHelper', () => {
  beforeEach(() => {
    mockDependencies();
    resetMockedServices();
    Object.defineProperty(window.history, 'state', {
      writable: true,
      value: {},
    });
    window.history.state = {
      state: {
        source: 'leftRail',
      },
    };
    MessageRouterChangeHelper.isIndexDone = true;
  });
  afterEach(() => {
    // jest.clearAllMocks();
  });
  describe('go to last group()', () => {
    it('should go to the last group when group is valid', async () => {
      await MessageRouterChangeHelper.goToLastOpenedGroup();
      expect(history.replace).toBeCalledWith('/messages/110');
      expect(mockedGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        110,
      );
    });
    it('should go to the default page when last group is invalid', async () => {
      mockedGroupService.valid = false;
      await MessageRouterChangeHelper.goToLastOpenedGroup();
      expect(history.replace).toBeCalledWith('/messages/');
      expect(mockedGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        0,
      );
    });
    it('should go to the default page when last group is hidden', async () => {
      mockedProfileService.hidden = true;
      await MessageRouterChangeHelper.goToLastOpenedGroup();
      expect(history.replace).toBeCalledWith('/messages/');
      expect(mockedGlobalStore.set).toBeCalledWith(
        GLOBAL_KEYS.CURRENT_CONVERSATION_ID,
        0,
      );
    });
  });
  describe('handleSourceOfRouter', () => {
    it('should access Group when the source is undefined', () => {
      window.history.state.state.source = undefined;
      MessageRouterChangeHelper.handleSourceOfRouter(110);
      expect(mockedGroupService.updateGroupLastAccessedTime).toBeCalledTimes(1);
    });
    it('should access Group when the source is other value except leftRail', () => {
      window.history.state.state.source = 'rightRail';
      MessageRouterChangeHelper.handleSourceOfRouter(110);
      expect(mockedGroupService.updateGroupLastAccessedTime).toBeCalledTimes(1);
    });
    it('should access Group when the state is leftRail', () => {
      MessageRouterChangeHelper.handleSourceOfRouter(110);
      expect(mockedGroupService.updateGroupLastAccessedTime).toBeCalledTimes(0);
    });
  });
});

describe('ensureGroupOpened', () => {
  beforeEach(() => {
    mockDependencies();
    resetMockedServices();
    Object.defineProperty(window.history, 'state', {
      writable: true,
      value: {},
    });
    window.history.state = {
      state: {
        source: '',
      },
    };
    mockedProfileService = {
      isConversationHidden: jest.fn(),
      reopenConversation: jest.fn(),
    };
    ProfileService.getInstance = jest
      .fn()
      .mockImplementation(() => mockedProfileService);
  });
  it('should call service to reopen', (done: any) => {
    mockedProfileService.isConversationHidden = jest
      .fn()
      .mockResolvedValueOnce(true);
    mockedProfileService.reopenConversation = jest
      .fn()
      .mockResolvedValueOnce({ isErr: () => false });
    MessageRouterChangeHelper.handleSourceOfRouter(110);
    setTimeout(() => {
      expect(mockedProfileService.reopenConversation).toHaveBeenCalled();
      done();
    });
  });
  it('should not call service to reopen when it is not hidden', () => {
    mockedProfileService.isConversationHidden = jest
      .fn()
      .mockResolvedValue(false);
    MessageRouterChangeHelper.handleSourceOfRouter(110);
    expect(mockedProfileService.reopenConversation).not.toHaveBeenCalled();
  });
  it('should show loading page with error when reopen failed', (done: any) => {
    mockedProfileService.isConversationHidden = jest
      .fn()
      .mockResolvedValueOnce(true);
    mockedProfileService.reopenConversation = jest
      .fn()
      .mockResolvedValueOnce({ isErr: () => true });
    MessageRouterChangeHelper.handleSourceOfRouter(110);
    setTimeout(() => {
      expect(mockedProfileService.reopenConversation).toHaveBeenCalled();
      expect(history.replace).toBeCalledWith('/messages/loading', {
        error: true,
        id: 110,
      });
      done();
    });
  });
});
