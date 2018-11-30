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
  font-size: 0;
  overflow: hidden;
  flex-shrink: 1;
  ${ellipsis()};
  .preposition {
    margin: ${spacing(0, 2, 0, 1)};
    color: ${grey('900')};
  }
  span {
    vertical-align: middle;
  }
  span.conversation-name,
  .preposition {
    ${typography('caption')};
  }
`;

const JuiConversationCardFrom = (props: ConversationCardFromProps) => (
  <StyledName onClick={props.onClick}>
    <span className="preposition">in</span>
    {props.isTeam ? <MuiIcon fontSize="small">people_outline</MuiIcon> : null}
    <span className="conversation-name">{props.name}</span>
  </StyledName>
);
export { JuiConversationCardFrom };
export default JuiConversationCardFrom;
