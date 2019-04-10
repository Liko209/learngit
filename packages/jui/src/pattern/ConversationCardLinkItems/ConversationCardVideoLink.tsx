/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-10 16:09:27
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons/IconButton';
import { JuiCard } from '../../components/Cards';
import { width, height, spacing, grey } from '../../foundation/utils/styles';

const LinkItemsWrapper = styled(JuiCard)`
  margin-top: ${spacing(3)};
  background-color: ${({ theme }) => theme.palette.common.white};
  width: 100%;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  padding: ${spacing(3)};
  box-sizing: border-box;
  :hover {
    background-color: ${grey('100')};
  }
`;
const LinkItemContents = styled.div`
  display: flex;
  & > span {
    color: ${({ theme }) => theme.palette.accent.ash};
    width: ${width(5)};
    height: ${height(5)};
    cursor: pointer;
    margin-top: ${spacing(-1)};
  }
`;

const TitleWithSummary = styled.div`
  display: flex;
  flex: 1;
  margin-left: ${spacing(3)};
  flex-direction: column;
  justify-content: space-between;
`;

type Props = {
  html?: string;
  onLinkItemClose?: (e: React.MouseEvent<HTMLSpanElement>) => void;
};

class JuiConversationCardVideoLink extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  onLinkItemClose = (event: React.MouseEvent<HTMLElement>) => {
    const { onLinkItemClose } = this.props;
    event.stopPropagation();
    onLinkItemClose && onLinkItemClose(event);
  }
  render() {
    const { html } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <TitleWithSummary
            dangerouslySetInnerHTML={{
              __html: html || '',
            }}
          />
          <JuiIconButton
            disableToolTip={true}
            variant="plain"
            onClick={this.onLinkItemClose}
          >
            close
          </JuiIconButton>
        </LinkItemContents>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardVideoLink };
