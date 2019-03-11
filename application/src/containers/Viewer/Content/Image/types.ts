/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:37
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '@/store/models/FileItem';
import { ViewerViewModelProps } from '../../types';

type ImageViewerProps = ViewerViewModelProps & {
  originElement?: HTMLElement;
};

type ImageViewerViewProps = ImageViewerProps & {
  item: FileItemModel;
  isLoadingMore: boolean;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  switchPreImage: () => void;
  switchNextImage: () => void;
};

export { ImageViewerProps, ImageViewerViewProps };
