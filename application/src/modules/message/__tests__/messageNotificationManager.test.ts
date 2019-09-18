/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
jest.unmock('@/common/emojiHelpers/map/mapAscii');
jest.unmock('@/common/emojiHelpers/map/mapEmojiOne');
jest.unmock('@/common/emojiHelpers/map/mapUnicode');

import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import * as utils from '@/store/utils';
import { MessageNotificationManager } from '../MessageNotificationManager';
import * as VM from '../MessageNotificationViewModel';
import GroupModel from '@/store/models/Group';
import PostModel from '../../../store/models/Post';
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS, SOUNDS_TYPE } from 'sdk/module/profile';
import * as i18n from '@/utils/i18nT';
import { CONVERSATION_TYPES } from '@/constants';
import { ENTITY_NAME } from '@/store';
import { MESSAGE_TYPE } from '../types';

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
    creator_id: 1,
  };
  const postFromGroup = {
    id: 4,
    group_id: 0,
    creator_id: 1,
  };
  const postFromTeam = {
    id: 2,
    group_id: 1,
    creator_id: 1,
  };
  const postWithMentionOthers = {
    id: 3,
    group_id: 1,
    at_mention_non_item_ids: [otherUserId],
    text: '',
    creator_id: 1,
  };
  const postWithMentionTeamMembers = {
    id: 111,
    isTeamMention: true,
    group_id: 1,
    at_mention_non_item_ids: [otherUserId],
    text: '',
    creator_id: 1,
  };
  const postWithMentionMe = {
    creator_id: otherUserId,
    id: 4,
    group_id: 1,
    at_mention_non_item_ids: [currentUserId],
    text: '',
    creator_id: 1,
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
    getSynchronously: (i: number) => {
      return { 1: team, 0: group }[i];
    },
  };

  const mockedProfileService = {
    isNotificationMute: jest.fn().mockReturnValue(false),
    getConversationPreference: () => conversationPreferences
  };

  const mockedCompanyService = {
    getById: async (i: number) => {
      return { customEmoji: {} };
    },
  };
  const settingItem = {
    value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
  };
  const conversationPreferences = {
    audioNotifications: {
      id: SOUNDS_TYPE.Default
    }
  }
  function mockSettingItemValue(value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS) {
    settingItem.value = value;
  }
  beforeEach(() => {
    const userId = 123432;
    jest.clearAllMocks();
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(currentUserId);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(type => {
      switch (type) {
        case ServiceConfig.POST_SERVICE:
          return mockedPostService;
        case ServiceConfig.GROUP_SERVICE:
          return mockedGroupService;
        case ServiceConfig.PROFILE_SERVICE:
          return mockedProfileService;
        case ServiceConfig.COMPANY_SERVICE:
          return mockedCompanyService;
        case ServiceConfig.SETTING_SERVICE:
          return { getById: () => settingItem };
        default:
          return { userConfig: { getGlipUserId: () => userId } };
      }
    });
    notificationManager = new MessageNotificationManager();
  });
  describe('shouldEmitNotification()', () => {
    beforeEach(() => {
      jest.spyOn(notificationManager, 'show').mockImplementation();
    });
    it('should not show notification when post is sent from current user', async () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValueOnce(1);
      const result = await notificationManager.shouldEmitNotification(
        postFromGroup,
      );
      expect(result).toBeUndefined();
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
        mockSettingItemValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF);
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
    describe('when post is from a conversation which has customized settings for notifications', () => {
      it('should not show notification when post is from a conversation which has muted notifications and user is not mentioned in this post [JPT-2834]', async () => {
        mockedProfileService.isNotificationMute.mockReturnValue(true);
        const result = await notificationManager.shouldEmitNotification(
          postMessage,
        );
        expect(result).toBeFalsy();
      });
      it('should show notification when post is from a conversation which has muted notifications and user is mentioned in this post', async () => {
        mockedProfileService.isNotificationMute.mockReturnValue(true);
        jest
          .spyOn(notificationManager, 'getCurrentMessageNotificationSetting')
          .mockImplementation(() =>
            Promise.resolve(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE),
          );
        const result = await notificationManager.shouldEmitNotification(
          postWithMentionMe,
        );
        expect(result).toBeTruthy();
      });
      it('should not show notification when post is from a conversation which has muted notifications and user is mentioned in this post but global setting for New Messages is Off', async () => {
        mockedProfileService.isNotificationMute.mockReturnValue(true);
        jest
          .spyOn(notificationManager, 'getCurrentMessageNotificationSetting')
          .mockImplementation(() =>
            Promise.resolve(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF),
          );
        const result = await notificationManager.shouldEmitNotification(
          postWithMentionMe,
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
    const mockPostData = {
      text: 'Post text',
      atMentionNonItemIds: [11370502],
    };
    const mockPersonData = {
      userDisplayName: 'Person name',
    };

    const atMentionNonItemIds = [2514947];
    const text =
      "<a class='at_mention_compose' rel='{\"id\":2514947}'>@Thomas Yang</a>";

    const mockMap = {
      [ENTITY_NAME.POST]: mockPostData,
      [ENTITY_NAME.PERSON]: mockPersonData,
    };
    beforeAll(() => {
      jest.resetAllMocks();
      jest.spyOn(i18n, 'default').mockImplementation((str: string) => str);
      jest.spyOn(i18n, 'i18nP').mockImplementation((str: string) => str);
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(false);
      jest.spyOn(utils, 'getEntity').mockImplementation((name, id) => {
        return mockMap[name];
      });
    });

    it('should return only user name for at mention', () => {
      expect(
        notificationManager.handlePostContent({
          text: `<a class='at_mention_compose' rel='{"id":12332}'>@Helena</a>`,
        } as PostModel),
      ).toEqual('Helena');
      expect(
        notificationManager.handlePostContent({
          text: `<a class='at_mention_compose' rel='{"id":12333}'>@Jack Sparrow</a>`,
        } as PostModel),
      ).toEqual('Jack Sparrow');
    });

    it('should remove markdown', () => {
      expect(
        notificationManager.handlePostContent({
          text: `**string words** [code]hello world[/code]`,
        } as PostModel),
      ).toEqual('string words hello world');
      expect(
        notificationManager.handlePostContent({
          text: `www.google.com https://www.yahoo.com chris@ring.com`,
        } as PostModel),
      ).toEqual('www.google.com https://www.yahoo.com chris@ring.com');
    });

    it('should return unicode emoji', () => {
      expect(
        notificationManager.handlePostContent({
          text: `:) <3 :D :joy:`,
        } as PostModel),
      ).toEqual('🙂 ❤ 😃 😂');
    });

    it('should be get person name when at mention a person', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;

      expect(
        notificationManager.handlePostContent(mockPostData as PostModel),
      ).toBe(`Person name`);
    });

    it('should be get new person name when person name be changed', () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      mockPersonData.userDisplayName = 'New person name';
      jest.spyOn(utils, 'getEntity').mockImplementation((name, id) => {
        return mockMap[name];
      });
      expect(
        notificationManager.handlePostContent(mockPostData as PostModel),
      ).toBe(`New person name`);
    });

    it(`should unescape for text lik "you'll get it"`, () => {
      expect(
        notificationManager.handlePostContent({
          text: `you'll get it`,
        } as PostModel),
      ).toEqual(`you'll get it`);
    });

    it('should remove quote markup', () => {
      expect(
        notificationManager.handlePostContent({
          text: `> @Andy Hu wrote:
> ddd
> lll
sfdasfasd`,
        } as PostModel),
      ).toEqual(` @Andy Hu wrote:
 ddd
 lll
sfdasfasd`);
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
      const datum = {
        post: new PostModel(postWithMentionOthers),
        person: { userDisplayName: names.userDisplayName },
        group: {
          members: [1, 2],
          displayName: names.teamDisplayName,
          isTeam: false,
          type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
        },
      };
      const type = notificationManager.getMessageType(datum.post, datum.group);
      const val = await notificationManager.buildNotificationBodyAndTitle(
        datum,
        type,
      );
      expect(val).toEqual({
        title: names.teamDisplayName,
        body: postWithMentionOthers.text,
      });
    });
    it('should build title and body for group and team conversation', async () => {
      const datum = {
        post: new PostModel(postWithMentionOthers),
        person: { userDisplayName: names.userDisplayName },
        group: { members: [1, 2, 3], displayName: names.teamDisplayName },
      };
      const type = notificationManager.getMessageType(datum.post, datum.group);
      const val = await notificationManager.buildNotificationBodyAndTitle(
        datum,
        type,
      );
      expect(i18n.default).toHaveBeenCalledTimes(2);
      expect(i18n.default).toHaveBeenCalledWith(
        'notification.group',
        translationArgs,
      );
      expect(val).toEqual({
        title: translation,
        body: postWithMentionOthers.text,
      });
    });
    it('should build title and body for @team mention conversation', async () => {
      const datum = {
        post: new PostModel(postWithMentionOthers),
        person: { userDisplayName: names.userDisplayName },
        group: { members: [1, 2, 3], displayName: names.teamDisplayName },
      };
      const type = notificationManager.getMessageType(datum.post, datum.group);
      const val = await notificationManager.buildNotificationBodyAndTitle(
        datum,
        type,
      );
      expect(i18n.default).toHaveBeenCalledTimes(2);
      expect(i18n.default).toHaveBeenCalledWith(
        'notification.group',
        translationArgs,
      );
      expect(val).toEqual({
        title: translation,
        body: postWithMentionTeamMembers.text,
      });
    });
    it('should build title and body for mentioned conversation', async () => {
      const datum = {
        post: new PostModel(postWithMentionMe),
        person: { userDisplayName: names.userDisplayName },
        group: { members: [1, 2, 3], displayName: names.teamDisplayName },
      };
      const type = notificationManager.getMessageType(datum.post, datum.group);
      const val = await notificationManager.buildNotificationBodyAndTitle(
        datum,
        type,
      );
      expect(i18n.default).toHaveBeenCalledTimes(3);
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
  describe('getCurrentMessageSoundSetting()', () => {
    it('should be Triple_Beeps when global setting for sound is Triple_Beeps and current conversation preference for sound is default [JPT-2836]', async () => {
      settingItem.value = {id: SOUNDS_TYPE.Triple_Beeps};
      const soundSetting = await notificationManager.getCurrentMessageSoundSetting(MESSAGE_TYPE.DIRECT_MESSAGE, new GroupModel(group));
      expect(soundSetting).toBe(SOUNDS_TYPE.Triple_Beeps)
    })
    it('should be Alert when global setting for sound is Triple_Beeps but current conversation preference for sound is Alert', async () => {
      settingItem.value = {id: SOUNDS_TYPE.Triple_Beeps};
      conversationPreferences.audioNotifications.id = SOUNDS_TYPE.Alert;
      const soundSetting = await notificationManager.getCurrentMessageSoundSetting(MESSAGE_TYPE.DIRECT_MESSAGE, new GroupModel(group));
      expect(soundSetting).toBe(SOUNDS_TYPE.Alert)
    })
    it('should be Double_Beeps when message type is @mention and global setting for @mention sound is Double_Beeps but current conversation preference for sound is Alert', async () => {
      settingItem.value = {id: SOUNDS_TYPE.Double_Beeps};
      conversationPreferences.audioNotifications.id = SOUNDS_TYPE.Alert;
      const soundSetting = await notificationManager.getCurrentMessageSoundSetting(MESSAGE_TYPE.MENTION, new GroupModel(group));
      expect(soundSetting).toBe(SOUNDS_TYPE.Double_Beeps)
    })
  })
});
