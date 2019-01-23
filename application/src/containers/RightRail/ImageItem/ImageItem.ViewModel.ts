/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 10:53:30
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { getFileType } from '@/common/getFileType';
import { ImageItemViewProps } from './types';
import { FileViewModel } from '../File.ViewModel';

class ImageItemViewModel extends FileViewModel implements ImageItemViewProps {
  @computed
  get url() {
    const { previewUrl } = getFileType(this.file);
    return previewUrl;
  }
}

export { ImageItemViewModel };
