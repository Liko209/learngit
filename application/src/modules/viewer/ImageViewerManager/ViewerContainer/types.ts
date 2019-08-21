/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:37
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '@/store/models/FileItem';
import { ImageViewerViewModule } from '../type';

type ImageViewerOptions = {
  originElement?: HTMLElement;
  thumbnailSrc?: string;
  initialWidth?: number;
  initialHeight?: number;
};
type ImageViewerProps = ImageViewerViewModule & {
  initialOptions: ImageViewerOptions;
};

type ImageViewerViewProps = ImageViewerProps & {
  item: FileItemModel;
  isLoadingMore: boolean;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailSrc?: string;
  closeViewer: () => void;
  setOnImageSwitchCb: (
    callback: (imgInfo: { width: number; height: number }) => void,
  ) => void;
};

export { ImageViewerProps, ImageViewerViewProps, ImageViewerOptions };
