/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 20:12:37
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { JuiCheckbox, CheckboxProps } from '../../../components/Checkbox';
import { palette } from '../../../foundation/utils';
import { Palette } from '../../../foundation/theme/theme';

type Props = {
  checked: boolean;
  customColor?: [keyof Palette, string];
} & CheckboxProps;

const WrapperCheckbox = ({ customColor, ...rest }: Props) => {
  return <JuiCheckbox {...rest} />;
};

const StyledTaskCheckbox = styled<Props>(WrapperCheckbox)`
  && {
    padding: 0;
    color: ${({ customColor }) => {
      return customColor ? palette(customColor[0], customColor[1]) : null;
    }};
    &.checked {
      color: ${palette('primary', 'main')};
    }
    svg {
      margin-top: 0;
    }
  }
`;

const JuiTaskCheckbox = memo((props: Props) => {
  const { customColor, checked, ...rest } = props;

  return (
    <StyledTaskCheckbox
      classes={{
        checked: 'checked',
      }}
      customColor={customColor}
      checked={checked}
      disableRipple={true}
      {...rest}
    />
  );
});

JuiTaskCheckbox.displayName = 'JuiTaskCheckbox';

export { JuiTaskCheckbox };
