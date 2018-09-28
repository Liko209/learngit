/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { IndicatorViewProps } from './types';

const IndicatorView = (props: IndicatorViewProps) => {
  let tag = '';
  if (props.draft) {
    tag = '[Draft]';
  }
  if (props.sendFailurePostIds.length > 0) {
    tag = '[Failure]'; // only show one
  }
  if (!tag) {
    return null;
  }
  return (
    <React.Fragment>
      {tag}
    </React.Fragment>
  );
};

export { IndicatorView };
