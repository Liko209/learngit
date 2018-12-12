/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 14:26:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { spacing, shape, grey, palette } from '../../foundation/utils';
import styled from '../../foundation/styled-components';
import Collapse from '@material-ui/core/Collapse';

type Props = {
  Like: React.ReactNode;
  likeCount: number;
};

const StyledConversationCardFooter = styled('div')`
  padding: ${spacing(0, 4, 4, 0)};
`;

const StyledIconWrapper = styled('div')`
  border: ${shape('border1')};
  border-color: ${grey('300')};
  border-radius: ${shape('borderRadius')};
  padding: ${spacing(1, 1.5)};
  display: inline-block;
  transition: all 0.1s ease-in;
  display: inline-flex;
  align-items: center;
  & > button {
    color: ${palette('primary', '700')};
    margin-right: ${spacing(1)};
  }
  & > span {
    color: ${grey('700')};
    font-size: ${spacing(3)};
  }
  &:hover {
    border-color: ${palette('primary', '700')};
  }
  &:active {
    background-color: ${palette('primary', '50')};
  }
`;

class JuiConversationCardFooter extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.likeButtonClickHandler = this.likeButtonClickHandler.bind(this);
  }

  likeButtonClickHandler(evt: React.MouseEvent) {
    evt.stopPropagation();
  }

  render() {
    const { Like, likeCount } = this.props;
    return (
      <Collapse in={!!likeCount}>
        <StyledConversationCardFooter>
          <StyledIconWrapper
            data-name="footerLikeButton"
            onClick={this.likeButtonClickHandler}
          >
            {Like}
            <span>{likeCount}</span>
          </StyledIconWrapper>
        </StyledConversationCardFooter>
      </Collapse>
    );
  }
}

export { JuiConversationCardFooter };
export default JuiConversationCardFooter;
