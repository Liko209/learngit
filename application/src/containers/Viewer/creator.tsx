/*
 * @Author: Paynter Chen
 * @Date: 2019-03-06 20:02:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Dialog } from '@/containers/Dialog';
import { Viewer } from './Viewer';
import { ImageViewer, ImageViewerOptions } from './Content/Image';
import { JuiDialogOpenTransition } from 'jui/components/Dialog';
import { ViewerViewModelProps } from './types';
import { VIEWER_ITEM_TYPE } from './constants';

export const showImageViewer = (
  groupId: number,
  imageId: number,
  initialOptions: ImageViewerOptions,
  mode?: string,
  postId?: number,
) => {
  // const { thumbnailSrc, originElement, origWidth, origHeight} = options;
  const { dismiss } = Dialog.simple(
    <Viewer
      itemId={imageId}
      groupId={groupId}
      type={VIEWER_ITEM_TYPE.IMAGE_FILES}
      isNavigation={mode === 'navigation'}
      postId={postId}
      contentLeftRender={(props: ViewerViewModelProps) => {
        return <ImageViewer {...props} initialOptions={initialOptions} />;
      }}
      viewerDestroyer={() => dismiss()}
    />,
    {
      fullScreen: true,
      hideBackdrop: true,
      TransitionComponent: JuiDialogOpenTransition,
      onKeyDown: (event: React.KeyboardEvent) => {
        // if ESC typed, just dismiss
        if (event.keyCode === 27) {
          dismiss();
        }
      },
    },
  );
};
