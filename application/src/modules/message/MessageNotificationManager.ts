/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { goToConversation } from '@/common/goToConversation';
import { POST_TYPE } from './../../common/getPostType';
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
import { NotificationOpts } from '../notification/interface';
import i18nT from '@/utils/i18nT';
import { PersonService } from 'sdk/module/person';
import { replaceAtMention } from './container/ConversationSheet/TextMessage/utils/handleAtMentionName';
import GroupModel from '@/store/models/Group';
import GroupService from 'sdk/module/group';
import { PostService } from 'sdk/module/post';
import { getPostType } from '@/common/getPostType';
import { IEntityChangeObserver } from 'sdk/framework/controller/types';
import { mainLogger } from 'sdk';
import { isFirefox, isWindows } from '@/common/isUserAgent';
import { throttle } from 'lodash';
import { Emoji } from './container/ConversationSheet/TextMessage/Emoji';
import { Company } from 'sdk/module/company/entity';
import CompanyModel from '../../store/models/Company';
import { Markdown } from 'glipdown';
import { glipdown2Html } from './container/ConversationSheet/TextMessage/utils/glipdown2Html';
const logger = mainLogger.tags('MessageNotificationManager');
const NOTIFY_THROTTLE_FACTOR = 5000;
export class MessageNotificationManager extends AbstractNotificationManager {
  protected _observer: IEntityChangeObserver;
  private _postService: PostService;
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

    if (post.deactivated) {
      this.handleDeletedPost(postId);
    }

    const result = await this.shouldEmitNotification(post);

    if (!result) {
      return;
    }
    const { postModel, groupModel } = result;

    const person = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      postModel.creatorId,
    );

    const { title, body } = await this.buildNotificationBodyAndTitle(
      postModel,
      person,
      groupModel,
    );

    const { members, isTeam } = groupModel;

    const opts: NotificationOpts = {
      body,
      renotify: false,
      icon: this.getIcon(person, members.length, isTeam),
      data: { id: postId, scope: this._scope },
      onClick: this.onClickHandlerBuilder(postModel.groupId, postId),
    };

    this.show(title, opts);
  }

  handleDeletedPost(postId: number) {
    this.close(postId);
  }

  async shouldEmitNotification(post: Post) {
    if (post.id <= 0) {
      logger.info(
        `notification for ${
          post.id
        } is not permitted because post is from local instead of service`,
      );
      return false;
    }
    if (!post || post.deactivated) {
      logger.info(
        `notification for ${
          post.id
        } is not permitted because post does not exist or has been deleted`,
      );
      return false;
    }
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    if (post.creator_id === currentUserId) {
      logger.info(
        `notification for ${
          post.id
        } is not permitted because post is created by current user`,
      );
      return false;
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

    if (groupModel.isTeam && !this.isMyselfAtMentioned(postModel)) {
      logger.info(
        `notification for ${
          post.id
        } is not permitted because in team conversation, only post mentioning current user will show notification`,
      );
      return false;
    }
    return { postModel, groupModel };
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
    let body: string;
    let title = group.displayName;
    if (post.existItemIds.length || post.parentId) {
      const { key, parameter } = getActivity(post, getActivityData(post));
      body = `${person.userDisplayName} ${await i18nT(key, parameter)}`;
    } else {
      if (this.isMyselfAtMentioned(post)) {
        title = await i18nT('notification.mentioned');
        body = group.displayName;
      } else {
        body = replaceAtMention(Markdown(post.text), (_, id, name) => name);
        body = glipdown2Html(this.handleEmoji(body));
      }
    }
    return { body, title };
  }
  handleEmoji(body: string): string {
    const staticServer = getGlobalValue(GLOBAL_KEYS.STATIC_HTTP_SERVER);
    const currentCompanyId = getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
    if (currentCompanyId <= 0) {
      return body;
    }
    const company =
      getEntity<Company, CompanyModel>(ENTITY_NAME.COMPANY, currentCompanyId) ||
      {};
    const { text } = new Emoji(body, staticServer, company.customEmoji, {
      unicodeOnly: true,
    });
    return text;
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
