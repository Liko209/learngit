/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-29 09:46:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';

import { palette, typography, grey } from '../../foundation/utils/styles';

const StyledButton = styled.button`
  &.at_mention_compose {
    max-width: 100%;
    padding: 0;
    border: none;
    background: none;
    text-align: left;
    ${typography('body1')};
    font-weight: ${({ theme }) => theme.typography.body2.fontWeight};
    color: ${palette('primary', 'main')};
    cursor: pointer;

    :active {
      outline: none;
    }

    :hover {
      text-decoration: underline;
    }
  }

  &.current {
    color: ${grey('900')};
    background-color: ${palette('secondary', '100')};
  }
`;

type JuiAtMentionProps = {
  id: string;
  name: React.ReactChild | (React.ReactChild | null)[] | null;
  isCurrent?: boolean;
};
const JuiAtMention = ({
  name,
  isCurrent = false,
  ...rest
}: JuiAtMentionProps) => (
  <StyledButton
    className={`at_mention_compose${isCurrent ? ' current' : ''}`}
    {...rest}
  >
    {name}
  </StyledButton>
);

export { JuiAtMention };
