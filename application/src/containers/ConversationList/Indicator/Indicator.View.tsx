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
  let tag;
  if (props.hasDraft) {
    tag = <JuiIndicatorDraft />; // '[Draft]'
  }
  if (props.sendFailurePostIds.length > 0) {
    tag = <JuiIndicatorFailure />; // '[Failure]'; // only show one
  }
  if (!tag) {
    return null;
  }
  return tag;
});

export { IndicatorView };
