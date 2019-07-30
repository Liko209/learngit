/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-07-22 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import {
  spacing,
  primary,
  grey,
  typography,
  palette,
  ellipsis,
} from '../../foundation/utils';
import { JuiButton, JuiButtonProps } from '../../components/Buttons/Button';
import { JuiIconLinkProps } from './types';

const Icon = styled(JuiIconography)`
  margin-right: ${spacing(1)};
  color: ${palette('grey', '600')};
`;

const Content = styled.span`
  min-width: 0;
  ${ellipsis()};
`;

const Link = styled<JuiButtonProps>(JuiButton)`
  &&& {
    ${typography('caption1')};
    display: inline-flex;
    padding: ${spacing(0, 1)};
    color: ${primary('600')};
    background-color: ${grey('100')};
    min-width: 0;
  }
`;

const JuiIconLink = ({ iconName, children, ...rest }: JuiIconLinkProps) => {
  const elIcon = iconName ? (
    <Icon iconSize="extraSmall">{iconName}</Icon>
  ) : null;

  return (
    <Link component="span" {...rest}>
      {elIcon}
      <Content>{children}</Content>
    </Link>
  );
};

export { JuiIconLink, JuiIconLinkProps };
