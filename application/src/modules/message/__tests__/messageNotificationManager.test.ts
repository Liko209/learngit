/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import * as utils from '@/store/utils';
import { MessageNotificationManager } from '../MessageNotificationManager';
import * as VM from '../MessageNotificationViewModel';
import GroupModel from '@/store/models/Group';
import PostModel from '../../../store/models/Post';
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import * as i18n from '@/utils/i18nT';
import { CONVERSATION_TYPES } from '@/constants';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AccountUserConfig');
describe('messageNotificationManager', () => {
  let notificationManager: MessageNotificationManager;
  const currentUserId = 110;
  const otherUserId = 111;
  const localPost = {
    id: -100,
  };
  const mockedPost = {
    id: 0,
    creator_id: currentUserId,
  };
  const mockedDeletedPost = {
    id: 1,
    deactivated: true,
  };
  const postFromGroup = {
    id: 4,
    group_id: 0,
  };
  const postFromTeam = {
    id: 2,
    group_id: 1,
  };
  const postWithMentionOthers = {
    id: 3,
    group_id: 1,
    at_mention_non_item_ids: [otherUserId],
    text: '',
  };
  const postWithMentionMe = {
    id: 4,
    group_id: 1,
    at_mention_non_item_ids: [currentUserId],
    text: '',
  };
  const team = {
    id: 1,
    is_team: true,
  };
  const group = {
    id: 0,
    is_team: false,
  };
  const mockedPostService = {
    getById: async (i: number) => {
      return {
        '-100': localPost,
        0: mockedPost,
        1: mockedDeletedPost,
        2: postFromTeam,
        3: postWithMentionOthers,
        4: postWithMentionMe,
      }[i];
    },
  };

  const mockedGroupService = {
    getById: async (i: number) => {
      return { 1: team, 0: group }[i];
    },
  };

  const mockedCompanyService = {
    getById: async (i: number) => {
      return { customEmoji: {} };
    },
  };
  beforeEach(() => {
    const userId = 123432;
    jest.clearAllMocks();
    notificationManager = new MessageNotificationManager();
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(currentUserId);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(type => {
      switch (type) {
        case ServiceConfig.POST_SERVICE:
          return mockedPostService;
        case ServiceConfig.GROUP_SERVICE:
          return mockedGroupService;
        case ServiceConfig.COMPANY_SERVICE:
          return mockedCompanyService;
        default:
          return { userConfig: { getGlipUserId: () => userId } };
      }
    });
  });
  describe('shouldEmitNotification()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockReturnValue({
        value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
      });
      jest.spyOn(notificationManager, 'show').mockImplementation();
    });

    it('should show notification when post is from group', async () => {
      const result = await notificationManager.shouldEmitNotification(
        postFromGroup,
      );
      expect(result).toBeTruthy();
    });
    it('should  show notification when post is from team and with current user @mentioned', async () => {
      const result = await notificationManager.shouldEmitNotification(
        postWithMentionMe,
      );
      expect(result).toBeTruthy();
    });
    describe('when notification settings turned to off', () => {
      beforeEach(() => {
        jest
          .spyOn(utils, 'getEntity')
          .mockReturnValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF);
      });
      it('should not show notification when post is from group', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postFromGroup,
        );
        expect(result).toBeFalsy();
      });
    });
    describe('when notification settings turned to @mention and direct message only', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest
          .spyOn(utils, 'getEntity')
          .mockReturnValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF);
      });
      it('should not show notification when post is from team with no @mention', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postFromTeam,
        );
        expect(result).toBeFalsy();
      });
      it('should not show notification when post is from team with @mention other users', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postWithMentionOthers,
        );
        expect(result).toBeFalsy();
      });
    });
    describe('when notification settings turned to @mention and direct message only', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest
          .spyOn(utils, 'getEntity')
          .mockReturnValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION);
      });
      it('should show notification when post is from team with no @mention', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postFromTeam,
        );
        expect(result).toBeFalsy();
      });
      it('should show notification when post is from team with @mention other users', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postWithMentionOthers,
        );
        expect(result).toBeFalsy();
      });
    });
  });
  describe('enqueueVm()', () => {
    let manager;
    const crushVmIntoManager = (times: number) => {
      [...Array(times)].forEach((_, index) => {
        notificationManager.enqueueVM(
          { id: index } as PostModel,
          {} as GroupModel,
        );
      });
    };

    beforeEach(() => {
      notificationManager.close = jest.fn();
      jest
        .spyOn(VM, 'MessageNotificationViewModel')
        .mockImplementation(function(
          _: number,
          hooks: { onDispose: Function },
        ) {
          return {
            dispose: hooks.onDispose,
          };
        });
    });
    it('should enqueue the vm into the vmQueue when called', () => {
      crushVmIntoManager(1);
      expect(notificationManager._vmQueue.length).toEqual(1);
    });
    it('should not enqueue the vm into the vmQueue when called with the existed id', () => {
      crushVmIntoManager(20);
      crushVmIntoManager(20);
      expect(notificationManager._vmQueue.length).toEqual(20);
    });
    it('should cut off vmQueue when exceeds', () => {
      crushVmIntoManager(51);
      expect(notificationManager._vmQueue.length).toEqual(50);
    });
    it('should remove the vm from vmQueue when disposed', () => {
      notificationManager._vmQueue = [];
      crushVmIntoManager(1);
      notificationManager._vmQueue[0].vm.dispose();
      expect(notificationManager._vmQueue.length).toEqual(0);
    });
  });

  describe('handlePostContent', () => {
    it('should return only user name for at mention', () => {
      expect(
        notificationManager.handlePostContent(
          `<a class='at_mention_compose' rel='{"id":12332}'>@Helena</a>`,
        ),
      ).toEqual('@Helena');
      expect(
        notificationManager.handlePostContent(
          `<a class='at_mention_compose' rel='{"id":12333}'>@Jack Sparrow</a>`,
        ),
      ).toEqual('@Jack Sparrow');
    });

    it('should remove markdown', () => {
      expect(
        notificationManager.handlePostContent(
          `**string words** [code]hello world[/code]`,
        ),
      ).toEqual('string words hello world');
      expect(
        notificationManager.handlePostContent(
          `www.google.com https://www.yahoo.com chris@ring.com`,
        ),
      ).toEqual('www.google.com https://www.yahoo.com chris@ring.com');
    });

    it('should return unicode emoji', () => {
      expect(notificationManager.handlePostContent(`:) <3 :D :joy:`)).toEqual(
        '🙂 ❤ 😃 😂',
      );
    });

    it(`should unescape for text lik "you'll get it"`, () => {
      expect(notificationManager.handlePostContent(`you'll get it`)).toEqual(
        `you'll get it`,
      );
    });
  });
  describe('buildNotificationBodyAndTitle', () => {
    const names = {
      userDisplayName: 'person',
      teamDisplayName: 'team',
    };
    const translationArgs = {
      person: names.userDisplayName,
      conversation: names.teamDisplayName,
    };
    const translation = 'tr';
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(currentUserId);
      jest.spyOn(i18n, 'default').mockResolvedValue(translation);
    });
    it('should build title and body for one2one conversation', async () => {
      const val = await notificationManager.buildNotificationBodyAndTitle(
        new PostModel(postWithMentionOthers),
        { userDisplayName: names.userDisplayName },
        {
          members: [1, 2],
          displayName: names.teamDisplayName,
          isTeam: false,
          type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
        },
      );
      expect(val).toEqual({
        title: names.teamDisplayName,
        body: postWithMentionOthers.text,
      });
    });
    it('should build title and body for group and team conversation', async () => {
      const val = await notificationManager.buildNotificationBodyAndTitle(
        new PostModel(postWithMentionOthers),
        { userDisplayName: names.userDisplayName },
        { members: [1, 2, 3], displayName: names.teamDisplayName },
      );
      expect(i18n.default).toHaveBeenCalledTimes(1);
      expect(i18n.default).toHaveBeenCalledWith(
        'notification.group',
        translationArgs,
      );
      expect(val).toEqual({
        title: translation,
        body: postWithMentionOthers.text,
      });
    });
    it('should build title and body for mentioned conversation', async () => {
      const val = await notificationManager.buildNotificationBodyAndTitle(
        new PostModel(postWithMentionMe),
        { userDisplayName: names.userDisplayName },
        { members: [1, 2, 3], displayName: names.teamDisplayName },
      );
      expect(i18n.default).toHaveBeenCalledTimes(2);
      expect(i18n.default).toHaveBeenCalledWith(
        'notification.mentioned',
        translationArgs,
      );
      expect(val).toEqual({
        title: translation,
        body: postWithMentionMe.text,
      });
    });
  });
});
