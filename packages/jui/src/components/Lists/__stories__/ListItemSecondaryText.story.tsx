/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 13:21:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { JuiListItemSecondaryText } from '../ListItemSecondaryText';
import { JuiListItemSecondarySpan } from '../ListItemSecondarySpan';

storiesOf('Components/Lists', module).add('JuiListItemSecondaryText', () => {
  const tLeft = text('leftText', 'Secondary text');
  const tRight = text('tRight', 'XX/XX/XXXX');

  const LeftText = <JuiListItemSecondarySpan text={tLeft} isEllipsis={true} />;
  const RightText = <span>{tRight}</span>;
  return (
    <div style={{ maxWidth: '200px' }}>
      <JuiListItemSecondaryText>
        {LeftText}
        &nbsp;·&nbsp;
        {RightText}
      </JuiListItemSecondaryText>
    </div>
  );
});
