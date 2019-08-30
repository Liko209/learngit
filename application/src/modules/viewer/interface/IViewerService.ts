/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ImageViewerOptions } from '../ImageViewerManager';

type ViewerProps = {
  itemId: number;
  groupId: number;
};
interface IViewerService {
  showImageViewer: (
    groupId: number,
    imageId: number,
    initialOptions: ImageViewerOptions,
    mode?: string,
    postId?: number,
  ) => void;
  showSingleImageViewer: (url: string, titleName: string) => void;
  open: (props: ViewerProps) => void;
}

export { IViewerService, ViewerProps };
