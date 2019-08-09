/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-29 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { PhotoEditView } from './PhotoEdit.View';
import { PhotoEditViewModel } from './PhotoEdit.ViewModel';
import { PhotoEditProps } from './types';

const PhotoEditContainer = buildContainer<PhotoEditProps>({
  View: PhotoEditView,
  ViewModel: PhotoEditViewModel,
});

const PhotoEdit = portalManager.wrapper(PhotoEditContainer);

export { PhotoEdit };
