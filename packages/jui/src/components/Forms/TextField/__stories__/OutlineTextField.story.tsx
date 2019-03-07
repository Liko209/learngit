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
      <div style={{ padding: '0 30%' }}>
        <JuiOutlineTextField />
        <br />
        <JuiOutlineTextField placeholder="Typing keywords" />
        <br />
        <JuiOutlineTextField
          placeholder="Only tying 3 characters"
          maxLength={3}
        />
        <br />
        <JuiOutlineTextField value="Disabled typing" disabled={true} />
        <br />
        <JuiOutlineTextField
          placeholder="Search members"
          iconName="search"
          iconPosition="left"
        />
        <br />
        <JuiOutlineTextField
          placeholder="Password"
          iconName="lock"
          iconPosition="right"
        />
      </div>
    );
  });
