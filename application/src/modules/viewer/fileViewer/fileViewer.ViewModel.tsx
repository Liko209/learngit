/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { computed } from 'mobx';
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
import { ItemVersionPage } from 'sdk/src/module/item/entity';

class FileViewerViewModel implements IViewerView {
  private _item: FileItemModel;
  private _postId: number;
  constructor(item: FileItemModel, postId: number) {
    this._item = item;
    this._postId = postId;
  }
  viewerDestroyer() {
    return this._postId;
  }

  @computed
  private get _person() {
    const { newestCreatorId } = this._item;
    return newestCreatorId
      ? getEntity(ENTITY_NAME.PERSON, newestCreatorId)
      : null;
  }

  @computed
  get pages() {
    const { versions } = this._item;
    const { pages } = versions[0];
    return pages
      ? pages.map(({ url }: ItemVersionPage) => (
          <img style={{ width: '100%' }} src={url} />
        ))
      : [<>loading...</>];
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

  @computed
  get actions() {
    return (
      <>
        <Download url={''} variant="round" />
      </>
    );
  }
}

export { FileViewerViewModel };
