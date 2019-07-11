/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { buildAtMentionMap } from '../../common/buildAtMentionMap';
import { UserSettingEntity, SettingService } from 'sdk/module/setting';
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
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import {
  NotificationOpts,
  NOTIFICATION_PRIORITY,
} from '../notification/interface';
import i18nT from '@/utils/i18nT';
import { PersonService } from 'sdk/module/person';
import GroupModel from '@/store/models/Group';
import GroupService from 'sdk/module/group';
import { PostService } from 'sdk/module/post';
import { getPostType } from '@/common/getPostType';
import { IEntityChangeObserver } from 'sdk/framework/controller/types';
import { mainLogger } from 'sdk';
import { isFirefox, isWindows } from '@/common/isUserAgent';
import { throttle } from 'lodash';
import { Remove_Markdown } from 'glipdown';
import { postParser } from '@/common/postParser';
import { renderToStaticMarkup } from 'react-dom/server';
import { MessageNotificationViewModel } from './MessageNotificationViewModel';
import SettingModel from '../../store/models/UserSetting';
import {
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
} from 'sdk/module/profile';
import { MESSAGE_SETTING_ITEM } from './interface/constant';
import { CONVERSATION_TYPES } from '@/constants';
import { HTMLUnescape } from '@/common/postParser/utils';

const logger = mainLogger.tags('MessageNotificationManager');
const NOTIFY_THROTTLE_FACTOR = 5000;
export class MessageNotificationManager extends AbstractNotificationManager {
  protected _observer: IEntityChangeObserver;
  private _postService: PostService;
  private _vmQueue: {
    id: number;
    vm: MessageNotificationViewModel;
  }[] = [];
  constructor() {
    super('message');
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
        this.buildNotification(postModel, groupModel);
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

  async buildNotification(postModel: PostModel, groupModel: GroupModel) {
    const person = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      postModel.creatorId,
    );
    const { title, body } = await this.buildNotificationBodyAndTitle(
      postModel,
      person,
      groupModel,
    );
    const opts = Object.assign(
      {
        body,
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
  get currentMessageNotificationSetting() {
    return (
      getEntity<UserSettingEntity, SettingModel<NOTIFICATION_OPTIONS>>(
        ENTITY_NAME.USER_SETTING,
        MESSAGE_SETTING_ITEM.NOTIFICATION_NEW_MESSAGES,
      ).value || 'default'
    );
  }
  async shouldEmitNotification(post: Post) {
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

    const group = await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).getById(post.group_id);

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
    const result = { postModel, groupModel };
    const strategy = {
      default: () => false,
      [DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE]: () => result,
      [DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION]: () => {
        if (groupModel.isTeam && !this.isMyselfAtMentioned(postModel)) {
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
    const settingService: SettingService;
    settingService.grq;
    return strategy[this.currentMessageNotificationSetting]();
  }

  onClickHandlerBuilder(groupId: number, jumpToPostId: number) {
    return () => {
      goToConversation({ jumpToPostId, conversationId: groupId });
    };
  }

  async buildNotificationBodyAndTitle(
    post: PostModel,
    person: PersonModel,
    group: GroupModel,
  ) {
    const isOne2One = group.type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
    const isActivity = post.existItemIds.length || post.parentId;
    const translationArgs = {
      person: person.userDisplayName,
      conversation: group.displayName,
    };
    let title =
      isOne2One || isActivity
        ? group.displayName
        : await i18nT('notification.group', translationArgs);
    let body = this.handlePostContent(post);
    if (this.isMyselfAtMentioned(post)) {
      if (isOne2One) {
        title = await i18nT('notification.mentionedOne2One', translationArgs);
      } else {
        title = await i18nT('notification.mentioned', translationArgs);
      }
    } else if (isActivity) {
      const { key, parameter } = getActivity(post, getActivityData(post));
      body = `${person.userDisplayName} ${await i18nT(key, parameter)}`;
    }
    return { body, title };
  }

  handlePostContent(post: PostModel) {
    const _text = Remove_Markdown(post.text, { dont_escape: true });
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
    return (
      post.atMentionNonItemIds &&
      post.atMentionNonItemIds.includes(currentUserId)
    );
  }

  getIcon(
    { id, headshotVersion = '', headshot = '', hasHeadShot }: PersonModel,
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
        headshotVersion,
        headshot,
        150,
      );
    }
    return headshotUrl || '/icon/defaultAvatar.png';
  }
  dispose() {
    this._postService.removeEntityNotificationObserver(this._observer);
  }
}
