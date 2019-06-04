/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { computed, observable } from 'mobx';
import { IViewerView } from '@/modules/viewer/container/ViewerView/interface';
import {
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
  JuiDialogHeaderSubtitle,
} from 'jui/components/Dialog/DialogHeader';
import { Avatar } from '@/containers/Avatar';
import { Download } from '@/containers/common/Download';

@observable
class FileViewerViewModel implements IViewerView {
  viewerDestroyer() {}

  @computed
  get pages() {
    return [1, 2, 3].map(v => <>{v}</>);
  }

  @computed
  get title() {
    return (
      <>
        <>name</>
        <JuiDialogHeaderSubtitle>subtitle</JuiDialogHeaderSubtitle>
      </>
    );
  }

  @computed
  get info() {
    return (
      <>
        <JuiDialogHeaderMetaLeft>
          <Avatar uid={1} data-test-automation-id={'previewerSenderAvatar'} />
        </JuiDialogHeaderMetaLeft>
        <JuiDialogHeaderMetaRight
          title={'lefttitle'}
          data-test-automation-id={'previewerSenderInfo'}
          subtitle={'leftsubtitle'}
        />
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
