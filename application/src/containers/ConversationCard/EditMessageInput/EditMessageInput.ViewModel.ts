/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:26
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { EditMessageInputProps, EditMessageInputViewProps } from './types';
import { PostService } from 'sdk/service';
import { getEntity } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PostModel from '@/store/models/Post';
import PersonModel from '@/store/models/Person';
import { Post } from 'sdk/module/post/entity';
import { Group } from 'sdk/module/group/entity';
import StoreViewModel from '@/store/ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { isAtMentions } from '@/containers/ConversationPage/MessageInput/handler';
import Keys from 'jui/pattern/MessageInput/keys';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'contentLength',
  CONTENT_ILLEGAL = 'contentIllegal',
}

class EditMessageInputViewModel extends StoreViewModel<EditMessageInputProps>
  implements EditMessageInputViewProps {
  private _postService: PostService;
  @computed
  get id() {
    return this.props.id;
  }
  @observable
  error: string = '';
  keyboardEventHandler = {
    enter: {
      key: Keys.ENTER,
      handler: this._enterHandler(this),
    },
    escape: {
      key: Keys.ESCAPE,
      handler: this._escHandler(),
    },
  };

  constructor(props: EditMessageInputProps) {
    super(props);
    this._postService = PostService.getInstance();
    this._exitEditMode = this._exitEditMode.bind(this);
    this._editPost = this._editPost.bind(this);
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get gid() {
    return this._post.groupId;
  }

  @computed
  get text() {
    return this._post.text;
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.gid);
  }

  @computed
  private get _members() {
    return this._group.members;
  }

  @computed
  private get _users() {
    return this._members.map((id: number) => {
      const { userDisplayName } = getEntity(
        ENTITY_NAME.PERSON,
        id,
      ) as PersonModel;
      return {
        id,
        display: userDisplayName,
      };
    });
  }

  @action
  private _enterHandler(vm: EditMessageInputViewModel) {
    return function () {
      // @ts-ignore
      const quill = (this as any).quill;
      const content = markdownFromDelta(quill.getContents());
      if (content.length > CONTENT_LENGTH) {
        vm.error = ERROR_TYPES.CONTENT_LENGTH;
        return;
      }
      if (content.includes(CONTENT_ILLEGAL)) {
        vm.error = ERROR_TYPES.CONTENT_ILLEGAL;
        return;
      }
      vm.error = '';
      if (content.trim()) {
        vm._editPost(content);
      }
    };
  }

  private _escHandler() {
    return this._exitEditMode;
  }

  @action
  private _exitEditMode() {
    const globalStore = storeManager.getGlobalStore();
    const inEditModePostIds = globalStore.get(
      GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS,
    );
    inEditModePostIds.splice(inEditModePostIds.indexOf(this.id), 1);
    globalStore.set(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS, [...inEditModePostIds]);
  }

  private async _editPost(content: string) {
    const atMentions = isAtMentions(content);
    try {
      await this._postService.modifyPost({
        atMentions,
        text: content,
        groupId: this.gid,
        postId: this.id,
        users: atMentions ? this._users : undefined,
      });
      this._exitEditMode();
    } catch (e) {
      // You do not need to handle the error because the message will display a resend
    }
  }
}

export {
  EditMessageInputViewModel,
  ERROR_TYPES,
  CONTENT_ILLEGAL,
  CONTENT_LENGTH,
};
