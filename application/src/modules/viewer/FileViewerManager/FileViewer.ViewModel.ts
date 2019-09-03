/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { computed, action, observable, Reaction } from 'mobx';

import { Person } from 'sdk/module/person/entity';
import { AbstractViewModel } from '@/base';
import {
  IViewerView,
  UpdateParamsType,
} from '@/modules/viewer/container/ViewerView/interface';
import moment from 'moment';
import FileItemModel from '@/store/models/FileItem';
import { dateFormatter } from '@/utils/date';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { ENTITY_NAME } from '@/store';
import { ItemVersionPage, Item, ItemVersions } from 'sdk/module/item/entity';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import portalManager from '@/common/PortalManager';

class FileViewerViewModel extends AbstractViewModel<IViewerView>
  implements IViewerView {
  private _itemId: number;
  private _groupId: number;
  private _dismiss: Function;
  @observable private _currentScale: number = 0;
  @observable private _currentVersion: ItemVersions;
  @observable private _currentPageIdx: number = 0;
  @observable private _textFieldValue: number = 1;
  @observable _sender: PersonModel | null;
  @observable _createdAt: number | null;

  constructor(itemId: number, groupId: number, dismiss: Function) {
    super();
    this._itemId = itemId;
    this._groupId = groupId;
    this._dismiss = dismiss;
    this._sender = null;
    this._createdAt = null;
    this.reaction(
      () => this._item.deactivated,
      async (deactivated: boolean) => {
        if (deactivated) {
          this._onExceptions('viewer.FileDeleted');
        }
      },
      {
        fireImmediately: true,
      },
    );
    this.reaction(
      () => this._item.latestVersion,
      async (item: ItemVersions, reaction: Reaction) => {
        this._currentVersion = { ...item };
        reaction.dispose();
      },
      {
        fireImmediately: true,
      },
    );
    this.autorun(this.updateSenderInfo);
  }

  updateSenderInfo = async () => {
    const post = await this._item.getDirectRelatedPostInGroup(this._groupId);

    if (post) {
      this._sender = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        post.creator_id,
      );
      this._createdAt = post.created_at;
      return;
    }
    this._sender = null;
    this._createdAt = null;
    return;
  };

  @computed
  private get _item() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._itemId);
  }

  viewerDestroyer() {
    this._dismiss();
  }

  @computed
  get pages() {
    const { origHeight, origWidth } = this._item;
    const { pages } = this._currentVersion;
    return pages
      ? pages.map(({ url }: ItemVersionPage) => ({
          url,
          viewport: {
            origHeight,
            origWidth,
          },
        }))
      : undefined;
  }

  @action
  handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { pages = [] } = this._currentVersion;
    let value = parseInt(e.target.value, 10);
    if (Number.isNaN(value)) return;
    value = value > pages.length ? pages.length : value;
    value = value < 1 ? 1 : value;
    this._textFieldValue = value;
    this._currentPageIdx = value - 1;
  };

  @computed
  get title() {
    let userDisplayName = '';
    let createdAt = '';
    let uid;
    if (this._sender) {
      userDisplayName = this._sender.userDisplayName;
      uid = this._sender.id;
    }
    if (this._createdAt) {
      createdAt = dateFormatter.dateAndTimeWithoutWeekday(
        moment(this._createdAt),
      );
    }
    const { name, downloadUrl, id } = this._item;
    const { pages = [] } = this._currentVersion;
    return {
      uid,
      userDisplayName,
      name,
      downloadUrl,
      createdAt,
      handleTextFieldChange: this.handleTextFieldChange,
      textFieldValue: this._textFieldValue,
      currentPageIdx: this._currentPageIdx + 1,
      pageTotal: pages.length,
      fileId: id,
      groupId: this._groupId,
    };
  }

  @computed
  get currentPageIdx() {
    return this._currentPageIdx;
  }

  @computed
  get currentScale() {
    return this._currentScale;
  }

  @action
  onUpdate = (opts: UpdateParamsType) => {
    const { scale, pageIdx } = opts;
    if (scale && scale !== this._currentScale) {
      this._currentScale = scale;
    }
    if (pageIdx !== undefined && pageIdx !== this._currentPageIdx) {
      this._currentPageIdx = pageIdx;
    }
  };

  private _onExceptions(toastMessage: string) {
    portalManager.dismissAll();
    Notification.flashToast({
      message: toastMessage,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }
}

export { FileViewerViewModel };
