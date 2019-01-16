/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 13:21:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiListItemSecondaryText } from '../ListItemSecondaryText';
import { JuiListItemSecondaryName } from '../ListItemSecondaryName';

storiesOf('Components/Lists', module)
  .addDecorator(withInfoDecorator(JuiListItemSecondaryText, { inline: true }))
  .add('JuiListItemSecondaryText', () => {
    const tLeft = text('leftText', 'Secondary text');
    const tRight = text('tRight', 'XX/XX/XXXX');

    const LeftText = <JuiListItemSecondaryName name={tLeft} />;
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
