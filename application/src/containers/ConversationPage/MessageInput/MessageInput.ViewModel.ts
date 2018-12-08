/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { debounce, Cancelable } from 'lodash';
import { MessageInputProps, MessageInputViewProps } from './types';
import { GroupService, PostService, ItemService } from 'sdk/service';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import StoreViewModel from '@/store/ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { isAtMentions } from './handler';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';
import { ItemFile } from 'sdk/models';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'contentLength',
  CONTENT_ILLEGAL = 'contentIllegal',
}

type DebounceFunction = (
  params: { id: number; draft: string },
) => Promise<boolean>;

class MessageInputViewModel extends StoreViewModel<MessageInputProps>
  implements MessageInputViewProps {
  private _groupService: GroupService;
  private _postService: PostService;
  private _itemService: ItemService;
  private _debounceUpdateGroupDraft: DebounceFunction & Cancelable;
  @computed
  get id() {
    return this.props.id;
  }
  @observable
  draft: string = '';
  @observable
  error: string = '';
  @observable
  items: ItemFile[] = [];
  @observable
  files: File[] = [];
  @observable
  duplicateFiles: File[] = [];
  @observable
  uniqueFiles: File[] = [];

  keyboardEventHandler = {
    enter: {
      key: 13,
      handler: this._enterHandler(this),
    },
  };

  constructor(props: MessageInputProps) {
    super(props);
    this._groupService = GroupService.getInstance();
    this._postService = PostService.getInstance();
    this._itemService = ItemService.getInstance();
    this._debounceUpdateGroupDraft = debounce<DebounceFunction>(
      this._groupService.updateGroupDraft.bind(this._groupService),
      500,
    );
    this._sendPost = this._sendPost.bind(this);
    this.reaction(
      () => this._initDraft,
      (initDraft: string) => {
        if (this.draft !== initDraft) {
          this.draft = this._initDraft;
        }
      },
    );
    this.reaction(
      () => this.id,
      () => {
        this.error = '';
      },
    );
    this.draft = this._initDraft;
  }

  @action
  changeDraft = (draft: string) => {
    this.error = '';
    // UI immediately sync
    this.draft = draft;
    // DB sync 500 ms later
    this._debounceUpdateGroupDraft({
      draft,
      id: this.id,
    });
  }

  forceSaveDraft = () => {
    // immediately save
    this.draft &&
      this._groupService.updateGroupDraft({
        draft: this.draft,
        id: this.id,
      });
  }

  @computed
  get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.id) as GroupModel;
  }

  @computed
  get _initDraft() {
    return this._group.draft || '';
  }

  @computed
  get _membersExcludeMe() {
    return this._group.membersExcludeMe;
  }

  @computed
  get _users() {
    return this._membersExcludeMe.map((id: number) => {
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
  private _enterHandler(vm: MessageInputViewModel) {
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
      if (content.trim() || vm.items.length > 0) {
        vm._sendPost(content);
        const onPostHandler = vm.props.onPost;
        onPostHandler && onPostHandler();
      }
    };
  }

  private async _sendPost(content: string) {
    this.changeDraft('');
    const atMentions = isAtMentions(content);
    try {
      await this._postService.sendPost({
        atMentions,
        text: content,
        groupId: this.id,
        users: atMentions ? this._users : undefined,
        itemIds: this.items.map(item => item.id),
      });
      // clear files after post
      this.files = [];
      this.items = [];
    } catch (e) {
      // You do not need to handle the error because the message will display a resend
    }
  }

  autoUploadFile = async (files: File[]) => {
    if (files.length > 0) {
      const uniques: File[] = [];
      const duplicateFiles: File[] = [];
      for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        const exists = await this.isFileExists(file);
        if (exists) {
          duplicateFiles.push(file);
        } else {
          uniques.push(file);
        }
      }

      this.uniqueFiles = uniques;
      // has duplicate files? will prompt user
      if (duplicateFiles.length > 0) {
        this.duplicateFiles = duplicateFiles;
      } else {
        // all files are unique, just upload them
        await this._uploadFiles(uniques, false);
        this.files = this.files.concat(uniques);
        this._clearUpSelectedFiles();
      }
    }
  }

  private _uploadFiles = async (files: File[], isUpdate: boolean) => {
    for (let i = 0; i < files.length; ++i) {
      await this.uploadFile(files[i], isUpdate);
    }
  }

  uploadFile = async (file: File, isUpdate: boolean) => {
    try {
      const form = new FormData();
      form.append(FILE_FORM_DATA_KEYS.FILE_NAME, file.name);
      form.append(FILE_FORM_DATA_KEYS.FILE, file);
      const item = await this._itemService.sendItemFile(
        this.id,
        form,
        isUpdate,
      );
      if (item) {
        this.items.push(item);
      }
      return item;
    } catch (e) {
      // TODO
      return null;
    }
  }

  isFileExists = async (file: File) => {
    return await this._itemService.isFileExists(this.id, file.name);
  }

  cancelUploadFile = async (file: File) => {
    const index = this.files.findIndex(looper => looper === file);
    if (index >= 0) {
      const item = this.items[index];
      await this._itemService.cancelUpload(item.id);
      this.files.splice(index, 1);
    }
  }

  private _clearUpSelectedFiles = () => {
    this.duplicateFiles = [];
    this.uniqueFiles = [];
  }

  cancelDuplicateFiles = () => {
    this._clearUpSelectedFiles();
  }

  // as new files
  uploadDuplicateFiles = async () => {
    await this._uploadFiles(this.duplicateFiles, false);
    await this._uploadFiles(this.uniqueFiles, false);
    // finally, update files
    this.files = this.files
      .concat(this.duplicateFiles)
      .concat(this.uniqueFiles);
    this._clearUpSelectedFiles();
  }

  updateDuplicateFiles = async () => {
    // TODO
    await this._uploadFiles(this.duplicateFiles, true);
    await this._uploadFiles(this.uniqueFiles, false);
    // finally, update files
    this.files = this.files.concat(this.uniqueFiles);
    this._clearUpSelectedFiles();
  }
}

export { MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH };
