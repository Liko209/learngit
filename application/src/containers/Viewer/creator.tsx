/*
 * @Author: Paynter Chen
 * @Date: 2019-03-06 20:02:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Dialog } from '@/containers/Dialog';
import { Viewer } from './Viewer';
import { ImageViewer } from './Content/Image';
import { JuiDialogOpenTransition } from 'jui/components/Dialog';
import { ViewerViewModelProps } from './types';
import { VIEWER_ITEM_TYPE } from './constants';

export const showImageViewer = (
  groupId: number,
  imageId: number,
  originElement?: HTMLElement,
) => {
  return Dialog.simple(
    <Viewer
      itemId={imageId}
      groupId={groupId}
      type={VIEWER_ITEM_TYPE.IMAGE_FILES}
      contentLeftRender={(props: ViewerViewModelProps) => {
        return <ImageViewer {...props} originElement={originElement} />;
      }}
    />,
    {
      fullScreen: true,
      hideBackdrop: true,
      TransitionComponent: JuiDialogOpenTransition,
    },
  );
};
