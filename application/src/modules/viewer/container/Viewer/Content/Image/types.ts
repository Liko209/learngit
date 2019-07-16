/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:37
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '@/store/models/FileItem';
import { ViewerViewProps } from '../../types';

type ImageViewerOptions = {
  originElement?: HTMLElement;
  thumbnailSrc?: string;
  initialWidth?: number;
  initialHeight?: number;
};
type ImageViewerProps = ViewerViewProps & {
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
};

export { ImageViewerProps, ImageViewerViewProps, ImageViewerOptions };
