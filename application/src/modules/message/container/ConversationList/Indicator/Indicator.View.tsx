/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { IndicatorViewProps } from './types';
import {
  JuiIndicatorDraft,
  JuiIndicatorFailure,
} from 'jui/pattern/ConversationList/Indicator';

const IndicatorView = observer((props: IndicatorViewProps) => {
  const tags = [];
  if (props.canPost) {
    if (props.sendFailurePostIds.length > 0) {
      tags.push(<JuiIndicatorFailure />); // '[Failure]'; // show all
    }
    if (props.hasDraft) {
      tags.push(<JuiIndicatorDraft />); // '[Draft]'
    }
  }
  if (!tags.length) {
    return null;
  }
  return <>{...tags}</>;
});

export { IndicatorView };
