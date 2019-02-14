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

const WrappedListItemSecondarySpan = ({
  isEllipsis,
  ...rest
}: {
  isEllipsis: boolean;
}) => <span {...rest} />;

const StyledListItemSecondarySpan = styled(WrappedListItemSecondarySpan)`
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

JuiListItemSecondarySpanComponent.displayName = 'JuiListItemSecondarySpan';

const JuiListItemSecondarySpan = memo(JuiListItemSecondarySpanComponent);

export { JuiListItemSecondarySpan, JuiListItemSecondarySpanProps };
