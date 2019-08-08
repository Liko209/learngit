/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:52
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ImageViewerView } from './ImageViewer.View';
import { ImageViewerViewModel } from './ImageViewer.ViewModel';
import { ImageViewerProps } from './types';

const ImageViewer = buildContainer<ImageViewerProps>({
  View: ImageViewerView,
  ViewModel: ImageViewerViewModel,
});

export { ImageViewer, ImageViewerProps };
