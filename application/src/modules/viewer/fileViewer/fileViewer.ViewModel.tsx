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
import {
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
  JuiDialogHeaderSubtitle,
} from 'jui/components/Dialog/DialogHeader';
import { Avatar } from '@/containers/Avatar';
import { Download } from '@/containers/common/Download';
import FileItemModel from '@/store/models/FileItem';
import { dateFormatter } from '@/utils/date';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { FileActionMenu } from '@/containers/common/fileAction';
import { ItemVersionPage } from 'sdk/module/item/entity';
import { Notification } from '@/containers/Notification';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiViewerTitleWrap } from 'jui/pattern/Viewer/ViewerTitle';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import portalManager from '@/common/PortalManager';
import _ from 'lodash';

class FileViewerViewModel extends AbstractViewModel<IViewerView>
  implements IViewerView {
  private _item: FileItemModel;
  private _dismiss: Function;
  @observable
  private _currentScale: number;
  @observable
  private _currentPageIdx: number;

  constructor(item: FileItemModel, dismiss: Function) {
    super();
    this._item = item;
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
            cmp: <img style={{ width: '100%' }} src={url} />,
            viewport: {
              origHeight,
              origWidth,
            },
          };
        })
      : undefined;
  }

  @computed
  get info() {
    let userDisplayName;
    let id;
    if (this._person) {
      userDisplayName = this._person.userDisplayName;
      id = this._person.id;
    }
    const { createdAt } = this._item;
    return (
      <>
        <JuiDialogHeaderMetaLeft>
          <Avatar uid={id} data-test-automation-id={'previewerSenderAvatar'} />
        </JuiDialogHeaderMetaLeft>
        <JuiDialogHeaderMetaRight
          title={userDisplayName}
          data-test-automation-id={'previewerSenderInfo'}
          subtitle={dateFormatter.dateAndTimeWithoutWeekday(moment(createdAt))}
        />
      </>
    );
  }

  @computed
  get title() {
    const { versions, name } = this._item;
    const { pages = [] } = versions[0];
    return (
      <JuiViewerTitleWrap>
        {name}
        <JuiTextField
          id="outlined-number"
          label=""
          type="number"
          value={1}
          onChange={() => {}}
          inputProps={{
            'aria-label': 'numberInput',
          }}
        />
        <JuiDialogHeaderSubtitle>{`100/${
          pages.length
        }`}</JuiDialogHeaderSubtitle>
      </JuiViewerTitleWrap>
    );
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
    console.log('--- fileViewer', opts);
    const { scale, pageIdx } = opts;
    if (scale && scale !== this._currentScale) {
      this._currentScale = scale;
    }
    if (pageIdx !== undefined && pageIdx !== this._currentPageIdx) {
      this._currentPageIdx = pageIdx;
    }
  }

  @computed
  get actions() {
    const { downloadUrl, id } = this._item;
    return (
      <>
        <Download url={downloadUrl} />
        <FileActionMenu fileId={id} disablePortal={true} />
      </>
    );
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
