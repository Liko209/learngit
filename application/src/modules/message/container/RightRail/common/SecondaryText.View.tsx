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
  name: string;
  time: string;
};

const SecondaryText = React.memo(({ name, time }: Props) => {
  return (
    <JuiListItemSecondaryText>
      <JuiListItemSecondarySpan text={name} isEllipsis={true} />
      &nbsp;·&nbsp;
      <JuiListItemSecondarySpan text={time} />
    </JuiListItemSecondaryText>
  );
});

export { SecondaryText };
