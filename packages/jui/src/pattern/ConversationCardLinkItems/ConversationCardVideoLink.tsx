/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-10 16:09:27
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons/IconButton';
import { JuiCard } from '../../components/Cards';
import {
  width,
  height,
  spacing,
  grey,
  typography,
} from '../../foundation/utils/styles';
import { withHighlight } from 'jui/hoc/withHighlight';

const LinkItemsWrapper = styled(JuiCard)`
  display: flex;
  justify-content: space-between;
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
  flex-direction: column;
  width: 100%;
  max-width: ${width(160)};
`;

const Title = styled.p`
  ${typography('subheading1')};
  margin: ${spacing(0, 0, 2, 0)};
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  a {
    color: ${grey('900')};
    &:hover {
      text-decoration: underline;
    }
  }
`;

const VideoWrapper = styled.div`
  iframe {
    width: 100%;
    max-width: ${width(160)};
    max-height: ${height(90)};
  }
`;

type Props = {
  title: string;
  url: string;
  html?: string;
  onLinkItemClose?: (e: React.MouseEvent<HTMLSpanElement>) => void;
};

@withHighlight(['title'])
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
    const { html, title, url } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <Title>
            <a
              href={url}
              target="_blank"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Title>
          <VideoWrapper
            dangerouslySetInnerHTML={{
              __html: html || '',
            }}
          />
        </LinkItemContents>
        <JuiIconButton
          disableToolTip={true}
          variant="plain"
          onClick={this.onLinkItemClose}
        >
          close
        </JuiIconButton>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardVideoLink };
