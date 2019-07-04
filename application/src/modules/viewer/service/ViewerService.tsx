/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialogOpenTransition } from 'jui/components/Dialog';
import { Dialog } from '@/containers/Dialog';
import { IViewerService } from '../interface';
import { FileViewerViewModel } from '../FileViewerManager';
import { ViewerView, LAYOUT } from '../container/ViewerView';
import { ViewerTitleView } from '../FileViewerManager/Title.View';
import { ViewerDocument } from '../FileViewerManager/ViewerContainer.View';

class ViewerService implements IViewerService {
  open = (itemId: number) => {
    const { dismiss } = Dialog.simple(
      <ViewerView
        dataModule={new FileViewerViewModel(itemId, () => dismiss())}
        layout={LAYOUT['withSideBar']}
        TitleRenderer={ViewerTitleView}
        PageRenderer={ViewerDocument}
      />,
      {
        fullScreen: true,
        hideBackdrop: true,
        TransitionComponent: JuiDialogOpenTransition,
        enableEscapeClose: true,
        onClose: () => dismiss(),
      },
    );
  }
}

export { ViewerService };
