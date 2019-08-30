/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialogOpenTransition } from 'jui/components/Dialog';
import { Dialog } from '@/containers/Dialog';
import { IViewerService } from '../interface';
import { FileViewerViewModel, FileViewerBuild } from '../FileViewerManager';
import {
  ImageViewerOptions,
  VIEWER_ITEM_TYPE,
  ImageViewerViewModel,
  SingleImageViewerViewModel,
} from '../ImageViewerManager';
import { ViewerView, LAYOUT } from '../container/ViewerView';
import { ViewerTitleView } from '../common/Title.View';
import { ViewerDocument } from '../FileViewerManager/ViewerContainer.View';

import {
  ImageViewerView,
  SingleImageViewerTitleView,
} from '../ImageViewerManager/ViewerContainer';

class ViewerService implements IViewerService {
  open = ({ itemId, groupId }: FileViewerBuild) => {
    const { dismiss } = Dialog.simple(
      <ViewerView
        dataModule={new FileViewerViewModel(itemId, groupId, () => dismiss())}
        layout={LAYOUT['withSideBar']}
        TitleRenderer={ViewerTitleView}
        PageRenderer={ViewerDocument}
      />,
      {
        fullScreen: true,
        hideBackdrop: true,
        TransitionComponent: JuiDialogOpenTransition as any,
        onClose: () => dismiss(),
      },
    );
  };

  showImageViewer = (
    groupId: number,
    imageId: number,
    initialOptions: ImageViewerOptions,
    mode?: string,
    postId?: number,
  ) => {
    const { dismiss } = Dialog.simple(
      <ViewerView
        dataModule={
          new ImageViewerViewModel({
            groupId,
            postId,
            initialOptions,
            dismiss: () => dismiss(),
            itemId: imageId,
            type: VIEWER_ITEM_TYPE.IMAGE_FILES,
            isNavigation: mode === 'navigation',
          })
        }
        unNeedZoomButtonGroup
        TitleRenderer={ViewerTitleView}
        PageRenderer={ImageViewerView}
      />,
      {
        fullScreen: true,
        hideBackdrop: true,
        TransitionComponent: JuiDialogOpenTransition as any,
        onClose: () => dismiss(),
      },
    );
  };

  showSingleImageViewer = (url: string, titleName: string) => {
    const { dismiss } = Dialog.simple(
      <ViewerView
        dataModule={
          new SingleImageViewerViewModel({
            url,
            titleName,
            dismiss: () => dismiss(),
          })
        }
        unNeedZoomButtonGroup
        TitleRenderer={SingleImageViewerTitleView}
        PageRenderer={ImageViewerView}
      />,
      {
        fullScreen: true,
        hideBackdrop: true,
        TransitionComponent: JuiDialogOpenTransition as any,
        onClose: () => dismiss(),
      },
    );
  };
}

export { ViewerService };
