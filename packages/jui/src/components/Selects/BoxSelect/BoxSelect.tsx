/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-12 09:37:21
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import { SelectProps } from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { StyledSelect, CLASSES_SELECT } from './StyledSelect';
import { StyledInput, CLASSES_INPUT_BASE } from './StyledInput';
import { HeightSize } from './types';

type Menu = {
  id: number | string;
  value: string;
};

type Props = SelectProps & {
  heightSize?: HeightSize;
  menu: Menu[];
};

// Selected Select doesn't open on enter
// https://github.com/mui-org/material-ui/issues/14626
class JuiBoxSelect extends PureComponent<Props> {
  private _renderInput = () => {
    const { heightSize = 'default' } = this.props;
    return <StyledInput classes={CLASSES_INPUT_BASE} heightSize={heightSize} />;
  }
  render() {
    const { menu, ...rest } = this.props;
    return (
      <StyledSelect
        classes={CLASSES_SELECT}
        input={this._renderInput()}
        {...rest}
      >
        {menu.map((item: Menu) => (
          <MenuItem value={item.id} key={item.id}>
            {item.value}
          </MenuItem>
        ))}
      </StyledSelect>
    );
  }
}

export { JuiBoxSelect };
