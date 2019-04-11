/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { POST_TYPE } from './../../common/getPostType';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GLOBAL_KEYS } from '@/store/constants';
import { Markdown } from 'glipdown';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { Post } from 'sdk/module/post/entity/Post';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { NotificationManager } from '@/modules/notification/manager';
import { notificationCenter, EVENT_TYPES } from 'sdk/service';
import {
  getActivity,
  getActivityData,
} from '@/containers/ConversationCard/Activity/handler/getActivity';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import { NotificationOpts } from '../notification/interface';
import i18nT from '@/utils/i18nT';
import { PersonService } from 'sdk/module/person';
import { replaceAtMention } from '@/containers/ConversationSheet/TextMessage/utils/handleAtMentionName';
import GroupModel from '@/store/models/Group';
import GroupService from 'sdk/module/group';
import { PostService } from 'sdk/module/post';
import { MessageRouterChangeHelper } from './container/Message/helper';
import { getPostType } from '@/common/getPostType';

export class MessageNotificationManager extends NotificationManager {
  constructor() {
    super('message');
  }

  init() {
    /* this should be replaced once SDK finished socket push notification */
    notificationCenter.on(`${ENTITY.POST}.*`, this.handlePostEntityChanged);
  }

  handlePostEntityChanged = async ({
    type,
    body: payload,
  }: NotificationEntityUpdatePayload<Post>) => {
    if (type !== EVENT_TYPES.UPDATE || payload.ids.length !== 1) {
      return;
    }

    const postId = payload.ids[0];
    const result = await this.shouldEmitNotification(postId);

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
      onClick: this.onClickHandlerBuilder(postModel.groupId),
    };

    this.show(title, opts);
  }

  async shouldEmitNotification(postId: number) {
    if (postId <= 0) {
      return false;
    }
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const post = await ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    ).getById(postId);

    if (!post || post.creator_id === currentUserId || post.deactivated) {
      return false;
    }
    const activityData = post.activity_data || {};
    const isPostType =
      !activityData.key || getPostType(activityData.key) === POST_TYPE.POST;
    if (!isPostType) {
      return false;
    }

    const group = await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).getById(post.group_id);

    if (!group) {
      return false;
    }

    const postModel = new PostModel(post);
    const groupModel = new GroupModel(group);

    if (groupModel.isTeam && !this.isMyselfAtMentioned(postModel)) {
      return false;
    }
    return { postModel, groupModel };
  }

  onClickHandlerBuilder(groupId: number) {
    return () => {
      MessageRouterChangeHelper.goToConversation(String(groupId));
    };
  }
  async buildNotificationBodyAndTitle(
    post: PostModel,
    person: PersonModel,
    group: GroupModel,
  ) {
    let body;
    let title = group.displayName;
    if (post.existItemIds.length || post.parentId) {
      const { key, parameter } = getActivity(post, getActivityData(post));
      body = `${person.userDisplayName} ${await i18nT(key, parameter)}`;
    } else {
      body = replaceAtMention(Markdown(post.text), (_, id, name) => name);
      if (this.isMyselfAtMentioned(post)) {
        title = await i18nT('notification.mentioned');
        body = group.displayName;
      }
    }
    return { body, title };
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
    notificationCenter.off(`${ENTITY.POST}.*`, this.handlePostEntityChanged);
  }
}
