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
import { spacing, grey, typography } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';

type JuiBoxSelectProps = SelectProps & {
  children: JSX.Element[];
  heightSize?: HeightSize;
  handleChange: (value: string) => void;
  label?: string;
  isFullWidth?: boolean;
};

const StyledSelectBoxContainer = styled.div`
  text-align: left;
  padding-bottom: ${spacing(3)};
`;
const StyledSelectBoxHeader = styled.div`
  color: ${grey('900Dark')};
  ${typography('body2')};
  padding-bottom: ${spacing(2)};
`;

class JuiBoxSelect extends PureComponent<
  JuiBoxSelectProps,
  { value: string | null }
> {
  private _renderInput = () => {
    const { heightSize = 'default' } = this.props;
    return <StyledInput classes={CLASSES_INPUT_BASE} heightSize={heightSize} />;
  }
  private _handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.handleChange(value);
  }

  render() {
    const { children, label, isFullWidth, ...rest } = this.props;
    return (
      <StyledSelectBoxContainer>
        <StyledSelectBoxHeader>{label}</StyledSelectBoxHeader>
        <StyledSelect
          classes={CLASSES_SELECT}
          style={isFullWidth ? { width: '100%' } : {}}
          input={this._renderInput()}
          onChange={this._handleChange}
          defaultValue={this.props.defaultValue}
          {...rest}
        >
          {children}
        </StyledSelect>
      </StyledSelectBoxContainer>
    );
  }
}

export { JuiBoxSelect, JuiBoxSelectProps };
