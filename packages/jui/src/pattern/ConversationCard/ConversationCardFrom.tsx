/*
 * @Author: Andy Hu
 * @Date: 2018-11-08 15:32:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { JuiIconography } from '../../foundation/Iconography';
import {
  typography,
  ellipsis,
  primary,
  spacing,
  grey,
} from '../../foundation/utils';
import styled from '../../foundation/styled-components';

type ConversationCardFromProps = {
  name: string;
  isTeam?: boolean;
  onClick: (e: React.MouseEvent) => any;
};
const StyledName = styled('div')`
  color: ${primary('700')};
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
    ${ellipsis()}
  }
`;

const JuiConversationCardFrom = React.memo(
  ({ onClick, isTeam, name, ...rest }: ConversationCardFromProps) => (
    <StyledName onClick={onClick} {...rest}>
      <span className="preposition">in</span>
      {isTeam ? <JuiIconography iconSize="small">team</JuiIconography> : null}
      <span className="conversation-name">{name}</span>
    </StyledName>
  ),
);
export { JuiConversationCardFrom };
export default JuiConversationCardFrom;
