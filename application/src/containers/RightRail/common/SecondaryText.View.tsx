/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 17:04:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  JuiListItemSecondaryText,
  JuiListItemSecondarySpan,
} from 'jui/components/Lists';

type Props = {
  personName: string;
  createdTime: string;
};

const SecondaryText = React.memo(({ personName, createdTime }: Props) => {
  return (
    <JuiListItemSecondaryText>
      <JuiListItemSecondarySpan text={personName} isEllipsis={true} />
      &nbsp;·&nbsp;
      <JuiListItemSecondarySpan text={createdTime} />
    </JuiListItemSecondaryText>
  );
});

export { SecondaryText };
