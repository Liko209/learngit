/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-12 10:20:55
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { DownloadProps, DownloadViewProps } from './types';

class DownloadViewModel extends AbstractViewModel<DownloadProps>
  implements DownloadViewProps {
  @computed
  get url() {
    return this.props.url;
  }

  get variant() {
    return this.props.variant;
  }
}

export { DownloadViewModel };
