/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 17:13:45
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils';

type JuiListItemSecondarySpanProps = {
  text?: string;
  isEllipsis?: boolean;
  children?: React.ReactNode;
};

const StyledListItemSecondarySpan = styled('span')`
  && {
    ${({ isEllipsis }: { isEllipsis: boolean }) => isEllipsis && ellipsis()};
  }
`;

const JuiListItemSecondarySpanComponent = (
  props: JuiListItemSecondarySpanProps,
) => {
  const { text, children, isEllipsis } = props;
  return (
    <StyledListItemSecondarySpan isEllipsis={isEllipsis || false}>
      {text ? text : ''}
      {children ? children : ''}
    </StyledListItemSecondarySpan>
  );
};

JuiListItemSecondarySpanComponent.displayName = 'JuiListItemSecondarySpanComponent';

const JuiListItemSecondarySpan = memo(JuiListItemSecondarySpanComponent);
JuiListItemSecondarySpan.displayName = 'JuiListItemSecondarySpan';
export { JuiListItemSecondarySpan, JuiListItemSecondarySpanProps };
