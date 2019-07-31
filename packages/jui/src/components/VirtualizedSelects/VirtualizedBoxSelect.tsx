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

type JuiVirtualizedBoxSelectProps = Exclude<JuiVirtualizedSelectProps, 'input'>;

const CLASSES = { focused: 'focused', input: 'select-input' };

const JuiVirtualizedBoxSelect = React.memo(
  (props: JuiVirtualizedBoxSelectProps) => {
    return (
      <JuiVirtualizedSelect
        input={<StyledSelect classes={CLASSES} />}
        {...props}
      />
    );
  },
);

export { JuiVirtualizedBoxSelect, JuiVirtualizedBoxSelectProps };
