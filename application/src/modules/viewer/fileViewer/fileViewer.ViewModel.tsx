/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { computed, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import { IViewerView } from '@/modules/viewer/container/ViewerView/interface';
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
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import portalManager from '@/common/PortalManager';
import _ from 'lodash';

const CHANGE_DEBOUNCE_TIME = 500;

class FileViewerViewModel extends AbstractViewModel<IViewerView>
  implements IViewerView {
  private _item: FileItemModel;
  private _dismiss: Function;
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
    const { name } = this._item;
    return (
      <>
        {name}
        <JuiDialogHeaderSubtitle> 100/100</JuiDialogHeaderSubtitle>
      </>
    );
  }

  @action
  handleCurrentPageIdxChange = _.debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // const value = e.target.value;
    },
    CHANGE_DEBOUNCE_TIME,
  );

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
