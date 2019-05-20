/*
 * @Author: Andy Hu
 * @Date: 2018-11-08 15:32:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import {
  typography,
  ellipsis,
  primary,
  spacing,
  grey,
  noop,
} from '../../foundation/utils';
import styled from '../../foundation/styled-components';

type ConversationCardFromProps = {
  name: string;
  prefix?: JSX.Element;
  onClick: (e: React.MouseEvent) => any;
  disabled?: boolean;
  preposition: JSX.Element;
};
const StyledName = styled('div')<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? grey('500') : primary('700'))};
  ${typography('caption1')};
  ${ellipsis()};
  box-sizing: border-box;
  padding-left: ${spacing(2)};
  display: flex;
  align-items: center;
  .preposition {
    margin-right: ${spacing(2)};
    color: ${grey('900')};
  }
  .conversation-name {
    color: ${({ disabled }) => (disabled ? grey('600') : 'inherit')};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')}};
  }
`;

const JuiConversationCardFrom = React.memo(
  ({
    onClick,
    name,
    disabled,
    prefix,
    preposition,
    ...rest
  }: ConversationCardFromProps) => (
    <StyledName
      onClick={disabled ? noop : onClick}
      disabled={disabled}
      data-disabled={disabled}
      data-name="cardHeaderFrom"
      {...rest}
    >
      <span className="preposition">{preposition}</span>
      {prefix}
      <span className="conversation-name">{name}</span>
    </StyledName>
  ),
);
export { JuiConversationCardFrom };
export default JuiConversationCardFrom;
