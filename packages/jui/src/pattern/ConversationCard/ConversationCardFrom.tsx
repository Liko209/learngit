/*
 * @Author: Andy Hu
 * @Date: 2018-11-08 15:32:23
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import MuiIcon from '@material-ui/core/Icon';
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
  ${typography('caption')};
  ${ellipsis()};
  box-sizing: border-box;
  padding-left: ${spacing(2)};
  .preposition {
    margin-right: ${spacing(2)};
    color: ${grey('900')};
  }
  span {
    vertical-align: middle;
  }
`;

const JuiConversationCardFrom = ({
  onClick,
  isTeam,
  name,
  ...rest
}: ConversationCardFromProps) => (
  <StyledName onClick={onClick} {...rest}>
    <span className="preposition">in</span>
    {isTeam ? <MuiIcon fontSize="small">people_outline</MuiIcon> : null}
    <span className="conversation-name">{name}</span>
  </StyledName>
);
export { JuiConversationCardFrom };
export default JuiConversationCardFrom;
