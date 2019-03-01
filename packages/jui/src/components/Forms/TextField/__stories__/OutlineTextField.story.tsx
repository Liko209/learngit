/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';

import { JuiOutlineTextField } from '..';

storiesOf('Components/Forms', module)
  .addDecorator(withInfoDecorator(JuiOutlineTextField, { inline: true }))
  .add('OutlineTextField', () => {
    return (
      <div style={{ padding: '0 10%' }}>
        <JuiOutlineTextField
          placeholder="Search member"
          iconName="search"
          iconPosition="left"
        />
        <br />
        <JuiOutlineTextField
          placeholder="MM/DD/YYYY"
          iconName="calendar"
          iconPosition="right"
        />
        <br />
        <JuiOutlineTextField placeholder="Typing keywords" />
      </div>
    );
  });
