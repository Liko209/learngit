/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 17:13:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils';

type JuiListItemSecondarySpanProps = {
  text: string;
  isEllipsis?: boolean;
};

const WrappedListItemSecondarySpan = ({
  isEllipsis,
  ...rest
}: {
  isEllipsis: boolean;
}) => <span {...rest} />;

const StyledListItemSecondarySpan = styled(WrappedListItemSecondarySpan)`
  && {
    ${({ isEllipsis }: { isEllipsis: boolean }) => isEllipsis && ellipsis()}
  }
`;

const JuiListItemSecondarySpan = (props: JuiListItemSecondarySpanProps) => {
  const { text, isEllipsis } = props;
  return (
    <StyledListItemSecondarySpan isEllipsis={isEllipsis || false}>
      {text}
    </StyledListItemSecondarySpan>
  );
};

JuiListItemSecondarySpan.displayName = 'JuiListItemSecondarySpan';

export { JuiListItemSecondarySpan, JuiListItemSecondarySpanProps };
