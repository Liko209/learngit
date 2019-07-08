/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { ViewerProps, ViewerViewProps } from '../types';
import { ReactElement } from 'react';

type ViewerContentViewModelProps = ViewerViewProps & ViewerProps;

type ViewerContentViewProps = {
  left: ReactElement;
  right: ReactElement;
};

export { ViewerContentViewModelProps, ViewerContentViewProps };
