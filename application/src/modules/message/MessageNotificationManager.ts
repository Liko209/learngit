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
import { PersonService } from 'sdk/src/module/person';
import { replaceAtMention } from '@/containers/ConversationSheet/TextMessage/utils/handleAtMentionName';
import history from '@/history';
import GroupModel from '@/store/models/Group';
import GroupService from 'sdk/src/module/group';

export class MessageNotificationManager extends NotificationManager {
  constructor() {
    super('message');
  }

  init() {
    notificationCenter.on(`${ENTITY.POST}.*`, this.handlePostEntityChanged);
  }

  handlePostEntityChanged = async ({
    type,
    body: payload,
  }: NotificationEntityUpdatePayload<Post>) => {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);

    /* this should be replaced once SDK finished socket push notification */

    if (type !== EVENT_TYPES.UPDATE || payload.ids.length !== 1) {
      return;
    }

    const postId = payload.ids[0];
    const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, postId);
    if (post.creatorId === currentUserId || postId <= 0) {
      return;
    }

    const conversation = await ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    ).getById(post.groupId);

    if (!conversation) {
      return;
    }
    const conversationModel = new GroupModel(conversation);
    const { members, is_team } = conversation;
    if (is_team && !this.isMyselfAtMentioned(post)) {
      return;
    }

    const person = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      post.creatorId,
    );

    const { title, body } = await this.buildNotificationBodyAndTitle(
      post,
      person,
      conversationModel,
    );

    const opts: NotificationOpts = {
      body,
      renotify: false,
      icon: this.getIcon(person, members.length, is_team),
      data: { id: postId, scope: this._scope },
      onClick: this.onClickHandlerBuilder(post.groupId),
    };
    this.show(title, opts);
  }

  onClickHandlerBuilder(groupId: number) {
    return () => {
      const currentURL = history.location.pathname;
      const targetURL = `/messages/${groupId}`;
      if (currentURL === targetURL) {
        history.replace(targetURL);
      } else {
        history.push(targetURL);
      }
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
