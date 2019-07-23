/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { IndicatorViewProps } from './types';
import { Umi, UMI_SECTION_TYPE } from '@/containers/Umi';
import {
  JuiIndicatorDraft,
  JuiIndicatorFailure,
} from 'jui/pattern/ConversationList/Indicator';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';

const IndicatorView = observer((props: IndicatorViewProps) => {
  const tags = [];
  if (props.canPost) {
    if (props.sendFailurePostIds.length > 0) {
      tags.push(<JuiIndicatorFailure key="Failure" />); // '[Failure]'; // show all
    }
    if (props.hasDraft) {
      tags.push(<JuiIndicatorDraft key="Draft" />); // '[Draft]'
    }

    if (props.showUmi) {
      tags.push(<Umi key="Umi" type={UMI_SECTION_TYPE.SINGLE} id={props.id} />); // '[Umi]'
    }
  }
  if (!tags.length) {
    return null;
  }
  return <JuiButtonBar overlapSize={-2}>{...tags}</JuiButtonBar>;
});

export { IndicatorView };
