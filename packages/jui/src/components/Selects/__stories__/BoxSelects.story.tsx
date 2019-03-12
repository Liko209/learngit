/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiBoxSelect } from '..';

class TestBoxSelect extends React.Component {
  state = {
    value: 1,
    menu: [
      { id: 1, value: 'One' },
      { id: 2, value: 'Two' },
      { id: 3, value: 'Three' },
    ],
  };
  onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    this.setState({ value });
  }

  render() {
    const { value, menu } = this.state;
    return (
      <div>
        <JuiBoxSelect value={value} menu={menu} onChange={this.onChange} />
        <br />
        <br />
        <JuiBoxSelect
          value={value}
          menu={menu}
          onChange={this.onChange}
          heightSize="large"
        />
        <br />
        <br />
        <JuiBoxSelect value={1} menu={menu} disabled={true} />
        <br />
        <br />
        <JuiBoxSelect
          value={1}
          menu={menu}
          disabled={true}
          heightSize="large"
        />
      </div>
    );
  }
}

storiesOf('Components/Selects', module)
  .addDecorator(withInfoDecorator(JuiBoxSelect, { inline: true }))
  .add('BoxSelect', () => {
    return (
      <div style={{ padding: '0 30%' }}>
        <TestBoxSelect />
      </div>
    );
  });
