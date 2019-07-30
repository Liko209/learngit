/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import { PhotoEditProps } from './types';
import { debounce } from 'lodash';

class PhotoEditViewModel extends AbstractViewModel<PhotoEditProps> {
  @observable currentScale: number = 1;

  @action
  updateScale = debounce(
    async (event: React.ChangeEvent<HTMLInputElement>, value: number) => {
      this.currentScale = value;
    },
    10,
    { maxWait: 1000 / 60 }, // Ensure 60FPS
  );
}

export { PhotoEditViewModel };
