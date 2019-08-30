/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-26 18:33:10
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
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
import './styles.css';

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
const defaultMenuProps = {
  classes: { paper: LIST_CLASS_NAME },
};

const JuiVirtualizedBoxSelect = React.memo(
  (props: JuiVirtualizedBoxSelectProps) => {
    const {
      label,
      className,
      isFullWidth,
      MenuProps,
      automationId,
      disabled,
      ...rest
    } = props;
    return (
      <StyledSelectBoxContainer className={className}>
        {label && <StyledSelectBoxHeader>{label}</StyledSelectBoxHeader>}
        <JuiVirtualizedSelect
          MenuProps={_.merge(
            defaultMenuProps,
            { 'data-test-automation-id': `${automationId}-list` },
            MenuProps ? MenuProps : {},
          )}
          input={
            <StyledSelect
              classes={CLASSES}
              className={disabled ? 'disabled' : ''}
              style={isFullWidth ? { width: '100%' } : {}}
            />
          }
          automationId={automationId}
          {...rest}
        />
      </StyledSelectBoxContainer>
    );
  },
);

export { JuiVirtualizedBoxSelect, JuiVirtualizedBoxSelectProps };
