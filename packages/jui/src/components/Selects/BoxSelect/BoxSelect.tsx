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
  label?: string;
  isFullWidth?: boolean;
  automationId: string;
};

const StyledSelectBoxContainer = styled.div`
  width: 100%;
  text-align: left;
  max-width: ${spacing(58)};
`;
const StyledSelectBoxHeader = styled.div`
  color: ${grey('600')};
  ${typography('caption2')};
  padding-bottom: ${spacing(2)};
`;

class JuiBoxSelect extends PureComponent<
  JuiBoxSelectProps,
  { value: string | null }
> {
  private _renderInput = () => {
    const { heightSize = 'default' } = this.props;
    return <StyledInput classes={CLASSES_INPUT_BASE} heightSize={heightSize} />;
  };

  render() {
    const {
      children,
      label,
      automationId,
      isFullWidth,
      className,
      renderValue,
      ...rest
    } = this.props;
    return (
      <StyledSelectBoxContainer className={className}>
        {label && <StyledSelectBoxHeader>{label}</StyledSelectBoxHeader>}
        <StyledSelect
          data-test-automation-id={automationId}
          classes={CLASSES_SELECT}
          style={isFullWidth ? { width: '100%' } : {}}
          input={this._renderInput()}
          renderValue={renderValue}
          {...rest}
        >
          {children}
        </StyledSelect>
      </StyledSelectBoxContainer>
    );
  }
}

export {
  JuiBoxSelect,
  JuiBoxSelectProps,
  StyledSelectBoxContainer,
  StyledSelectBoxHeader,
};
