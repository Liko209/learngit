/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { buildAtMentionMap } from '../../common/buildAtMentionMap';
import { goToConversation } from '@/common/goToConversation';
import { POST_TYPE } from '../../common/getPostType';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GLOBAL_KEYS } from '@/store/constants';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { Post } from 'sdk/module/post/entity/Post';
import { AbstractNotificationManager } from '@/modules/notification/manager';
import {
  getActivity,
  getActivityData,
} from './container/ConversationCard/Activity/handler/getActivity';
import { getEntity, getGlobalValue } from '@/store/utils';
import storeManager, { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import {
  NotificationOpts,
  NOTIFICATION_PRIORITY,
  NotificationStrategy,
} from '../notification/interface';
import i18nT from '@/utils/i18nT';
import { PersonService } from 'sdk/module/person';
import GroupModel from '@/store/models/Group';
import { GroupService } from 'sdk/module/group';
import { PostService } from 'sdk/module/post';
import { getPostType } from '@/common/getPostType';
import { IEntityChangeObserver } from 'sdk/framework/controller/types';
import { mainLogger } from 'foundation/log';
import { isFirefox, isWindows } from '@/common/isUserAgent';
import { throttle } from 'lodash';
import { Remove_Markdown } from 'glipdown';
import { postParser } from '@/common/postParser';
import { renderToStaticMarkup } from 'react-dom/server';
import { MessageNotificationViewModel } from './MessageNotificationViewModel';
import {
  ProfileService,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  AUDIO_SOUNDS_INFO,
  SOUNDS_TYPE,
} from 'sdk/module/profile';
import { MESSAGE_SETTING_ITEM } from './interface/constant';
import { CONVERSATION_TYPES } from '@/constants';
import { HTMLUnescape } from '@/common/postParser/utils';
import { SettingService } from 'sdk/module/setting/service/SettingService';
import { IMessageNotificationManager } from './interface';
import { MESSAGE_TYPE } from './types';
import { GlipTypeUtil } from 'sdk/utils';
import { getIntegration } from './container/ConversationSheet/IntegrationItem/getIntegration';

const logger = mainLogger.tags('MessageNotificationManager');
const NOTIFY_THROTTLE_FACTOR = 5000;


type MessageTypeInfo = {
  isMention: boolean;
  isActivity: boolean;
  isOne2One: boolean;
  isIntegration: boolean;
  messageType: MESSAGE_TYPE;
};
class MessageNotificationManager extends AbstractNotificationManager
  implements IMessageNotificationManager {
  protected _observer: IEntityChangeObserver;
  private _postService: PostService;
  private _profileService: ProfileService;
  private _settingService: SettingService;
  private _vmQueue: {
    id: number;
    vm: MessageNotificationViewModel;
  }[] = [];

  constructor() {
    super('message');
    this._profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    this._settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    this._observer = {
      onEntitiesChanged:
        isFirefox && isWindows
          ? throttle(this.handlePostEntityChanged, NOTIFY_THROTTLE_FACTOR)
          : this.handlePostEntityChanged,
    };
  }

  init() {
    this._postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    this._postService.addEntityNotificationObserver(this._observer);
  }

  handlePostEntityChanged = async (entities: Post[]) => {
    storeManager.dispatchUpdatedDataModels(ENTITY_NAME.POST, entities);
    const post = entities[0];
    const postId = post.id;
    logger.info(`prepare notification for ${postId}`);
    const result = await this.shouldEmitNotification(post);
    if (!result) {
      return;
    }
    const { postModel, groupModel } = result;
    this.enqueueVM(postModel, groupModel);
  };

  enqueueVM(postModel: PostModel, groupModel: GroupModel) {
    const id = postModel.id;
    const ids = this._vmQueue.map(i => i.id);
    if (ids.includes(id)) {
      return;
    }
    const MAX_SIZE = 50;
    const vm = new MessageNotificationViewModel(id, {
      onCreate: () => this.buildNotification(postModel, groupModel),

      onUpdate: (id: number) => {
        const postModel = getEntity<Post, PostModel>(ENTITY_NAME.POST, id);

        this.buildNotification(postModel, groupModel, true);
      },
      onDispose: () => {
        this.close(id);
        this._vmQueue = this._vmQueue.filter(i => i.id !== id);
      },
    });

    if (this._vmQueue.length >= MAX_SIZE) {
      const notification = this._vmQueue[MAX_SIZE - 1];
      if (!notification) {
        logger.warn(
          'notification view model not found, current length is',
          this._vmQueue.length,
        );
      } else {
        notification.vm.dispose();
      }
      delete this._vmQueue[MAX_SIZE - 1];
      this._vmQueue.length = MAX_SIZE - 1;
    }
    this._vmQueue.unshift({ id, vm });
  }

  async buildNotification(
    postModel: PostModel,
    groupModel: GroupModel,
    muteSounds?: boolean,
  ) {
    const person = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      postModel.creatorId,
    );
    const type = this.getMessageType(postModel, groupModel);
    const datum = { person, post: postModel, group: groupModel };
    const { title, body } = await this.buildNotificationBodyAndTitle(
      datum,
      type,
    );
    const sound =
      !muteSounds &&
      (await this.getCurrentMessageSoundSetting(type.messageType, groupModel));
    const opts = Object.assign(
      {
        body,
        sound,
      },
      await this.buildNotificationOption(postModel, groupModel, person),
    );
    this.show(title, opts);
  }

  async buildNotificationOption(
    postModel: PostModel,
    groupModel: GroupModel,
    person: PersonModel,
  ) {
    const { members, isTeam } = groupModel;
    const opts: NotificationOpts = {
      renotify: false,
      strategy: NotificationStrategy.SOUND_AND_UI_NOTIFICATION,
      icon: this.getIcon(person, members.length, isTeam),
      data: {
        id: postModel.id,
        scope: this._scope,
        priority: NOTIFICATION_PRIORITY.MESSAGE,
      },
      onClick: this.onClickHandlerBuilder(postModel.groupId, postModel.id),
    };
    return opts;
  }
  async getCurrentMessageSoundSetting(type: MESSAGE_TYPE, groupModel: GroupModel) {
    if (type !== MESSAGE_TYPE.MENTION) {
      const { audioNotifications } = await this._profileService.getConversationPreference(
        groupModel.id,
      );
      if (audioNotifications.id !== SOUNDS_TYPE.Default) {
        return audioNotifications.id;
      }
    }
    const { DIRECT_MESSAGE, TEAM, MENTION } = MESSAGE_TYPE;
    const soundSettingDict = {
      [DIRECT_MESSAGE]: MESSAGE_SETTING_ITEM.SOUND_DIRECT_MESSAGES,
      [MENTION]: MESSAGE_SETTING_ITEM.SOUND_MENTIONS,
      [TEAM]: MESSAGE_SETTING_ITEM.SOUND_TEAM_MESSAGES,
    };
    const entity = await this._settingService.getById<AUDIO_SOUNDS_INFO>(soundSettingDict[type]);
    return entity && entity.value && entity.value.id;
  }

  async getCurrentMessageNotificationSetting() {
    const entity = await this._settingService.getById<DESKTOP_MESSAGE_NOTIFICATION_OPTIONS>(
      MESSAGE_SETTING_ITEM.NOTIFICATION_NEW_MESSAGES,
    );
    return (entity && entity.value) || 'default';
  }
  async shouldEmitNotification(post: Post) {
    const currentUser = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    if (post.creator_id === currentUser) {
      return;
    }
    const activityData = post.activity_data || {};
    const isPostType =
      !activityData.key || getPostType(activityData.key) === POST_TYPE.POST;
    if (!isPostType) {
      logger.info(
        `notification for ${
          post.id
        } is not permitted because post type is not message`,
      );
      return false;
    }
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const group = groupService.getSynchronously(post.group_id) || await groupService.getById(post.group_id);

    if (!group) {
      logger.info(
        `notification for ${
          post.id
        } is not permitted because group of the post does not exist`,
      );
      return false;
    }

    const postModel = new PostModel(post);
    const groupModel = new GroupModel(group);

    const shouldMuteNotification = await this._profileService.isNotificationMute(
      post.group_id,
    );
    const isMentioned = this.isMyselfAtMentioned(postModel);
    const setting: string = await this.getCurrentMessageNotificationSetting();
    if (
      !shouldMuteNotification ||
      (isMentioned && setting !== DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF)
    ) {
      const result = { postModel, groupModel };
      const strategy = {
        default: () => false,
        [DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE]: () => result,
        [DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION]: () => {
          if (groupModel.isTeam && !isMentioned) {
            logger.info(
              `notification for ${
                post.id
              } is not permitted because in team conversation, only post mentioning current user will show notification`,
            );
            return false;
          }
          return result;
        },
        [DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF]: () => false,
      };
      return strategy[setting]();
    }
  }

  onClickHandlerBuilder(groupId: number, jumpToPostId: number) {
    return () => {
      goToConversation({ jumpToPostId, conversationId: groupId });
    };
  }

  getMessageType(post: PostModel, group: GroupModel) {
    const isOne2One = group.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
    const isIntegration = post.itemIds.some(GlipTypeUtil.isIntegrationType);
    const isActivity = !!(post.existItemIds.length || post.parentId);
    const isMention = !!this.isMyselfAtMentioned(post);
    const messageType = isMention
      ? MESSAGE_TYPE.MENTION
      : isOne2One
      ? MESSAGE_TYPE.DIRECT_MESSAGE
      : MESSAGE_TYPE.TEAM;
    return { isActivity, isOne2One, isMention, messageType, isIntegration };
  }

  async buildNotificationBodyAndTitle(
    {
      post,
      person,
      group,
    }: {
      post: PostModel;
      person: PersonModel;
      group: GroupModel;
    },
    { isOne2One, isActivity, isMention, isIntegration }: MessageTypeInfo,
  ) {
    const senderName = person.userDisplayName;
    const translationArgs = {
      person: senderName,
      conversation: group.displayName,
    };
    let title =
      isOne2One || isActivity || isIntegration
        ? group.displayName
        : await i18nT('notification.group', translationArgs);
    let body = this.handlePostContent(post);

    if (isMention) {
      if (isOne2One) {
        title = await i18nT('notification.mentionedOne2One', translationArgs);
      } else {
        title = await i18nT('notification.mentioned', translationArgs);
      }
    } else if (isIntegration) {
      body = await getIntegration(post, senderName,true) || senderName;
    } else if (isActivity) {
      const { key, parameter } = getActivity(post, getActivityData(post));
      body = `${senderName} ${await i18nT(key, parameter)}`;
    }
    return { body, title };
  }

  handlePostContent(post: PostModel) {
    const _text = Remove_Markdown(post.text, { dont_escape: true }).replace(
      /(^|\n)> ([^\n]*)/g,
      (full_match, start, text) => `${start} ${text}`,
    );
    const parsedResult = postParser(_text, {
      atMentions: {
        customReplaceFunc: (match, id, name) => name,
        map: buildAtMentionMap(post),
      },
      emoji: {
        unicodeOnly: true,
      },
    });
    if (typeof parsedResult === 'string') {
      return parsedResult;
    }
    return HTMLUnescape(
      renderToStaticMarkup(parsedResult as React.ReactElement),
    );
  }

  isMyselfAtMentioned(post: PostModel) {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const isTeamMention = post.isTeamMention;
    return (
      (post.atMentionNonItemIds &&
        post.atMentionNonItemIds.includes(currentUserId)) ||
      isTeamMention
    );
  }

  getIcon(
    { id, headshotVersion, headshot = '', hasHeadShot }: PersonModel,
    memberCount: number,
    isTeam?: boolean,
  ) {
    if (isTeam) {
      return '/icon/defaultTeamAvatar.png';
    }
    if (memberCount > 2) {
      return '/icon/defaultGroupAvatar.png';
    }

    let headshotUrl;
    if (hasHeadShot) {
      const personService = ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      );
      headshotUrl = personService.getHeadShotWithSize(
        id,
        headshot,
        150,
        headshotVersion,
      );
    }
    return headshotUrl || '/icon/defaultAvatar.png';
  }
  dispose() {
    this._postService.removeEntityNotificationObserver(this._observer);
  }
}

export { MessageNotificationManager };
