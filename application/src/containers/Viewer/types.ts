/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
type viewerType = 'imageViewer';
type ViewerProps = {
  viewerType: viewerType;
  itemId: number; // imageId || fileId || otherItemId
};

type ViewerViewProps = ViewerProps;

export { ViewerProps, ViewerViewProps, viewerType };
