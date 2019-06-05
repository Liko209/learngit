/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialogOpenTransition } from 'jui/components/Dialog';
import { Dialog } from '@/containers/Dialog';
import { IViewerService } from '../interface';
import { FileViewerViewModel } from '../fileViewer';
import { ViewerView } from '../container/ViewerView';
import FileItemModel from '@/store/models/FileItem';

class ViewerService implements IViewerService {
  showFileViewer = (item: FileItemModel, postId: number) => {
    const { dismiss } = Dialog.simple(
      <ViewerView dataModule={new FileViewerViewModel(item, postId)} />,
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
