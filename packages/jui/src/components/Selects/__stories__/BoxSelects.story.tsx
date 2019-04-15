/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:54:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../foundation/utils/decorators';
import { boolean, select } from '@storybook/addon-knobs';
import { JuiBoxSelect } from '..';
import { JuiMenuItem } from 'src/components/Menus';

type Menu = {
  id: number | string;
  value: string;
};

function getKnobs() {
  const heightSize = select(
    'heightSize',
    {
      default: 'default',
      large: 'large',
    },
    'large',
  );
  const menuItemStyle = select(
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

class TestBoxSelect extends React.Component<{
  heightSize: 'default' | 'large';
  menuItemStyle?: 'fixed' | 'MUINative';
  disabled: boolean;
}> {
  state = {
    value: 1,
    menu: [
      { id: 1, value: 'One' },
      { id: 2, value: 'Two' },
      { id: 3, value: 'Three' },
    ],
  };
  handleChange = (value: string | number) => {
    this.setState({ value });
  }

  render() {
    const { menu, ...rest } = this.state;
    const { disabled, heightSize } = this.props;
    const MenuProps: any = {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'left',
      },
      getContentAnchorEl: null,
    };

    return (
      <JuiBoxSelect
        {...this.state}
        MenuProps={this.props.menuItemStyle === 'fixed' ? MenuProps : {}}
        heightSize={heightSize}
        disabled={disabled}
        label="Select Demo"
        handleChange={this.handleChange}
        automationId={'demo'}
      >
        {menu.map((item: Menu) => (
          <JuiMenuItem {...rest} value={item.id} key={item.id}>
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
