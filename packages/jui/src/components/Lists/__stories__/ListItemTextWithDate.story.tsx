/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 13:21:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiListItemTextWithDate } from '../ListItemTextWithDate';

storiesOf('Components/Lists', module)
  .addDecorator(withInfoDecorator(JuiListItemTextWithDate, { inline: true }))
  .add('JuiListItemTextWithDate', () => {
    const t = text('text', 'Secondary text · XX/XX/XXXX');
    return (
      <div style={{ maxWidth: '200px' }}>
        <JuiListItemTextWithDate text={t} />
      </div>
    );
  });
