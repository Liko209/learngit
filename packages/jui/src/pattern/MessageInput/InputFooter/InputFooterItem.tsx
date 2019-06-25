/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-21 14:46:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, memo } from 'react';
import styled from '../../../foundation/styled-components';
import { grey, typography } from '../../../foundation/utils/styles';
import { JuiFade } from '../../../components/Animation';
import { JuiText } from '../../../components/Text';
import { ExitHandler } from 'react-transition-group/Transition';

type InputFooterItemProps = {
  show: boolean;
  content: ComponentType | string;
  align: 'left' | 'right' | 'center';
  onExited: ExitHandler;
};

const InputFooterItemWrapper = styled(JuiFade)<{
  align: InputFooterItemProps['align'];
}>`
  width: 100%;
  text-align: ${({ align }) => align};
`;

const ContentWrapper = styled(JuiText)`
  && {
    ${typography('caption1')};
    color: ${grey('500')};
  }
`;

const JuiInputFooterItem: React.SFC<InputFooterItemProps> = memo(
  ({ show, align, content, onExited, ...rest }: InputFooterItemProps) => (
    <InputFooterItemWrapper
      align={align}
      show={show}
      duration="standard"
      easing="sharp"
      appear={true}
      onExited={onExited}
      {...rest}
    >
      <ContentWrapper>{content}</ContentWrapper>
    </InputFooterItemWrapper>
  ),
);

export { JuiInputFooterItem, InputFooterItemProps };
