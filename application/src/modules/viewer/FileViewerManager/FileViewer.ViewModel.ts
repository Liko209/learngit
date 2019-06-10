/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { computed, action, observable } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  IViewerView,
  UpdateParamsType,
} from '@/modules/viewer/container/ViewerView/interface';
import moment from 'moment';
import FileItemModel from '@/store/models/FileItem';
import { dateFormatter } from '@/utils/date';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { ItemVersionPage, Item } from 'sdk/module/item/entity';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import portalManager from '@/common/PortalManager';
import _ from 'lodash';

class FileViewerViewModel extends AbstractViewModel<IViewerView>
  implements IViewerView {
  private _itemId: number;
  private _dismiss: Function;
  @observable
  private _currentScale: number = 1;
  @observable
  private _currentPageIdx: number = 0;

  @observable
  private _textFieldValue: number = 1;

  constructor(itemId: number, dismiss: Function) {
    super();
    this._itemId = itemId;
    this._dismiss = dismiss;
    this.reaction(
      () => this._item.deactivated,
      async (deactivated: boolean) => {
        if (deactivated) {
          this._onExceptions('viewer.ImageDeleted');
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  private get _item() {
    return getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, this._itemId);
  }

  @computed
  private get _person() {
    const { newestCreatorId } = this._item;
    return newestCreatorId
      ? getEntity(ENTITY_NAME.PERSON, newestCreatorId)
      : null;
  }

  viewerDestroyer() {
    this._dismiss();
  }

  @computed
  get pages() {
    const { versions, origHeight, origWidth } = this._item;
    const { pages } = versions[0];
    return pages
      ? pages.map(({ url }: ItemVersionPage) => {
          return {
            url,
            viewport: {
              origHeight,
              origWidth,
            },
          };
        })
      : undefined;
  }

  @action
  handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { versions } = this._item;
    const { pages = [] } = versions[0];
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    value = value > pages.length ? pages.length : value;
    value = value < 1 ? 1 : value;
    this._textFieldValue = value;
    this._currentPageIdx = value - 1;
  }

  @computed
  get title() {
    let userDisplayName;
    let uid;
    if (this._person) {
      userDisplayName = this._person.userDisplayName;
      uid = this._person.id;
    }
    const { createdAt } = this._item;

    const { versions, name, downloadUrl, id } = this._item;
    const { pages = [] } = versions[0];
    return {
      uid,
      userDisplayName,
      name,
      downloadUrl,
      handleTextFieldChange: this.handleTextFieldChange,
      createdAt: dateFormatter.dateAndTimeWithoutWeekday(moment(createdAt)),
      textFieldValue: this._textFieldValue,
      currentPageIdx: this._currentPageIdx + 1,
      pageTotal: pages.length,
      fileId: id,
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
  }

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
