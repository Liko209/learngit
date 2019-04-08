/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-12 09:37:21
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import { SelectProps } from '@material-ui/core/Select';
import { StyledSelect, CLASSES_SELECT } from './StyledSelect';
import { StyledInput, CLASSES_INPUT_BASE } from './StyledInput';
import { HeightSize } from './types';

type Props = SelectProps & {
  children: JSX.Element[];
  heightSize?: HeightSize;
  handleChange: (value: string) => void;
};

// Selected Select doesn't open on enter
// https://github.com/mui-org/material-ui/issues/14626
class JuiBoxSelect extends PureComponent<Props> {
  private _renderInput = () => {
    const { heightSize = 'default' } = this.props;
    return <StyledInput classes={CLASSES_INPUT_BASE} heightSize={heightSize} />;
  }
  private _handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.handleChange(value);
  }
  render() {
    const { children, ...rest } = this.props;
    return (
      <StyledSelect
        classes={CLASSES_SELECT}
        input={this._renderInput()}
        onChange={this._handleChange}
        {...rest}
      >
        {children}
      </StyledSelect>
    );
  }
}

export { JuiBoxSelect };
