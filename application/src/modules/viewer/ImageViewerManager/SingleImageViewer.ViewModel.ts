/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import { IViewerView } from '@/modules/viewer/container/ViewerView/interface';
import { SingleImageViewerViewModuleProps } from './types';

class SingleImageViewerViewModel
  extends AbstractViewModel<SingleImageViewerViewModuleProps>
  implements IViewerView {
  currentPageIdx = 0;
  currentScale = 0;
  hasPrevious = false;
  hasNext = false;

  viewerDestroyer() {
    this.props.dismiss && this.props.dismiss();
  }

  @computed
  get pages() {
    return [
      {
        url: this.props.url || '',
        viewport: {
          origHeight: 0,
          origWidth: 0,
        },
      },
    ];
  }

  @computed
  get title() {
    return {
      displayName: this.props.titleName,
    };
  }

  @action
  onUpdate = () => {};
}

export { SingleImageViewerViewModel };
