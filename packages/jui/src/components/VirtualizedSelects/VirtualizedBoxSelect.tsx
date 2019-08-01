/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-26 18:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiVirtualizedSelect,
  JuiVirtualizedSelectProps,
} from './VirtualizedSelect';
import { StyledSelect } from './styles';
import {
  StyledSelectBoxContainer,
  StyledSelectBoxHeader,
} from '../Selects/BoxSelect';

type JuiVirtualizedBoxSelectProps = Exclude<
  JuiVirtualizedSelectProps,
  'input'
> & {
  automationId: string;
  className?: string;
  label?: string;
  isFullWidth?: boolean;
};

const CLASSES = { focused: 'focused', input: 'select-input' };
const LIST_CLASS_NAME = 'virtualized_select-list-container';
const defaultMenuProps = { classes: { paper: LIST_CLASS_NAME } };

const JuiVirtualizedBoxSelect = React.memo(
  (props: JuiVirtualizedBoxSelectProps) => {
    const { label, className, isFullWidth, MenuProps, ...rest } = props;
    return (
      <StyledSelectBoxContainer className={className}>
        {label && <StyledSelectBoxHeader>{label}</StyledSelectBoxHeader>}
        <JuiVirtualizedSelect
          MenuProps={MenuProps ? MenuProps : defaultMenuProps}
          input={
            <StyledSelect
              classes={CLASSES}
              style={isFullWidth ? { width: '100%' } : {}}
            />
          }
          {...rest}
        />
      </StyledSelectBoxContainer>
    );
  },
);

export { JuiVirtualizedBoxSelect, JuiVirtualizedBoxSelectProps };
