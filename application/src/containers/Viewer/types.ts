import { ReactElement } from 'react';

/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
type ViewerProps = {
  containComponent: ReactElement<any>;
  itemId: number; // imageId || fileId || otherItemId
};

type ViewerViewProps = ViewerProps;

export { ViewerProps, ViewerViewProps };
