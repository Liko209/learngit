/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../foundation/utils/decorators';
import { boolean, select } from '@storybook/addon-knobs';
import { JuiBoxSelect } from '..';
import { JuiMenuItem } from '../../../components/Menus';

type Menu = {
  id: number | string;
  value: string;
};

type TestBoxSelectProps = {
  heightSize: 'default' | 'large';
  menuItemStyle?: 'fixed' | 'MUINative';
  disabled: boolean;
};

function getKnobs() {
  const heightSize = select<TestBoxSelectProps['heightSize']>(
    'heightSize',
    {
      default: 'default',
      large: 'large',
    },
    'large',
  );
  const menuItemStyle = select<TestBoxSelectProps['menuItemStyle']>(
    'menuItemStyle',
    {
      MUINative: 'MUINative',
      Fixed: 'fixed',
    },
    'MUINative',
  );
  const disabled = boolean('disabled', false);
  return {
    heightSize,
    disabled,
    menuItemStyle,
  };
}

const menu = [
  { id: 1, value: 'One' },
  { id: 2, value: 'Two' },
  { id: 3, value: 'Three' },
];

const MenuProps: any = {
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  getContentAnchorEl: null,
};

class TestBoxSelect extends React.Component<TestBoxSelectProps> {
  state = {
    value: 1,
  };
  handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.setState({ value });
  }

  render() {
    const { disabled, heightSize } = this.props;

    return (
      <JuiBoxSelect
        {...this.state}
        MenuProps={this.props.menuItemStyle === 'fixed' ? MenuProps : {}}
        heightSize={heightSize}
        disabled={disabled}
        label="Select Demo"
        onChange={this.handleChange}
        automationId={'demo'}
      >
        {menu.map((item: Menu) => (
          <JuiMenuItem value={item.id} key={item.id}>
            {item.value}
          </JuiMenuItem>
        ))}
      </JuiBoxSelect>
    );
  }
}

storiesOf('Components/Selects', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiBoxSelect, { inline: true }))
  .add('BoxSelect', () => {
    return (
      <div style={{ padding: '0 30%' }}>
        <TestBoxSelect {...getKnobs()} />
      </div>
    );
  });
