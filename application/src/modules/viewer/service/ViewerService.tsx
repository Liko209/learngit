/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { inject } from 'framework';
import { JuiDialogOpenTransition } from 'jui/components/Dialog';
import { Dialog } from '@/containers/Dialog';
import { ViewerStore } from '../store';
import { IViewerService } from '../interface';
import { ViewerView } from '../container/ViewerView';

class ViewerService implements IViewerService {
  @inject(ViewerStore) private _ViewerStore: ViewerStore;
  showFileViewer = () => {
    console.log(this._ViewerStore, 'looper22');
    const { dismiss } = Dialog.simple(
      <ViewerView viewerDestroyer={() => dismiss()} />,
      {
        fullScreen: true,
        hideBackdrop: true,
        TransitionComponent: JuiDialogOpenTransition,
        enableEscapeClose: true,
        onClose: () => dismiss(),
      },
    );
    console.log(dismiss, 'looper22');
  }
}

export { ViewerService };
