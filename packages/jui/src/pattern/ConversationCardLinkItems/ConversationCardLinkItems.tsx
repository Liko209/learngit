/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, ReactNode } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons/IconButton';
import { JuiCard } from '../../components/Cards';
import {
  width,
  height,
  spacing,
  grey,
  lineClamp,
  typography,
} from '../../foundation/utils/styles';
import { Theme } from '../../foundation/theme/theme';
import defaultLinkImage from './link_img@2x.png';

const LinkItemsWrapper = styled(JuiCard)`
  position: relative;
  margin-top: ${spacing(3)};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.palette.common.white};
  width: 100%;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  padding: ${spacing(3)};
  box-sizing: border-box;
  :hover {
    background-color: ${grey('100')};
  }
  button {
    position: absolute;
    right: ${spacing(2)};
    top: ${spacing(3)};
    transition: none;
  }
`;
const LinkItemContents = styled.div`
  display: flex;
  & > span {
    color: ${({ theme }: { theme: Theme }) => theme.palette.accent.ash};
    width: ${width(5)};
    height: ${height(5)};
    cursor: pointer;
    margin-top: ${spacing(-1)};
  }
`;
const LinkThumbnails = styled.div<{ img: string }>`
  width: ${width(30)};
  height: ${height(30)};
  background: no-repeat center url(${({ img }) => img});
  background-size: contain;
  background-color: ${grey('300')};
`;

const TitleNSummaryWrapper = styled.div``;
const TitleWithSummary = styled.div`
  display: flex;
  flex: 1;
  margin-left: ${spacing(3)};
  flex-direction: column;
  justify-content: space-between;
`;
const LinkTitle = styled.p`
  ${typography('subheading1')};
  margin: ${spacing(0, 4, 2, 0)};
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

function getMaxHeight(lineHeight: any, lineNumber: number) {
  const heightNumber: number = Number(lineHeight.replace(/[^-\d.]/g, ''));
  const unit: string = lineHeight.replace(/[-\d.]/g, '');
  return `${heightNumber * lineNumber}${unit}`;
}
class JuiLinkItemsWrappers extends PureComponent<{
  children: ReactNode;
  onLinkItemClose: (e: React.MouseEvent<HTMLSpanElement>) => void;
  isShowCloseBtn: boolean;
}> {
  render() {
    const { isShowCloseBtn } = this.props;
    return (
      <LinkItemsWrapper data-test-automation-id="linkItemsWrapper">
        {isShowCloseBtn ? (
          <JuiIconButton
            disableToolTip
            variant="plain"
            data-id="closeBtn"
            onClick={this.props.onLinkItemClose}
            data-test-automation-id="linkPreviewCloseBtn"
          >
            close
          </JuiIconButton>
        ) : null}
        {this.props.children}
      </LinkItemsWrapper>
    );
  }
}
const LinkSummary = styled.p`
  ${({ theme }) => theme.typography.body1};
  color: ${grey('500')};
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-top: ${spacing(-1)};
  max-height: ${({ theme }) =>
    getMaxHeight(theme.typography.body1.lineHeight, 2)}; /* firefox */
`;

const FaviconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Favicon = styled.span<{ favicon?: string }>`
  width: ${width(5)};
  height: ${height(5)};
  margin: ${spacing(0, 2, 0, 0)};
  display: inline-block;
  background-size: cover;
  background-image: url(${({ favicon }) => favicon});
`;
const FaviconName = styled.span`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${grey('500')};
`;
const Title = styled.p`
  display: flex;
  justify-content: space-between;
  ${typography('subheading1')};
  margin: ${spacing(0, 4, 2, 0)};
  ${lineClamp(2, 12)};
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
const LinkVideoContents = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${width(160)};
`;

type Props = {
  title: React.ReactChild | (React.ReactChild | null)[] | null;
  summary?: React.ReactChild | (React.ReactChild | null)[] | null;
  thumbnail?: string;
  onLinkItemClose?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  url: string;
  html?: string;
  favicon?: string;
  faviconName?: string;
  isShowCloseBtn: boolean;
};
class JuiConversationCardLinkItems extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  onLinkItemClose = (event: React.MouseEvent<HTMLElement>) => {
    const { onLinkItemClose } = this.props;
    event.stopPropagation();
    onLinkItemClose && onLinkItemClose(event);
  };
  private _renderLinkCard() {
    const { title, summary, thumbnail, url, favicon, faviconName } = this.props;
    return (
      <LinkItemContents>
        <LinkThumbnails img={thumbnail ? thumbnail : defaultLinkImage} />
        <TitleWithSummary>
          <TitleNSummaryWrapper>
            <LinkTitle data-test-automation-id="linkItemTitle">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            </LinkTitle>
            <LinkSummary data-test-automation-id="linkItemSummary">
              {summary}
            </LinkSummary>
          </TitleNSummaryWrapper>
          <FaviconWrapper>
            <Favicon favicon={favicon} />
            <FaviconName>{faviconName}</FaviconName>
          </FaviconWrapper>
        </TitleWithSummary>
      </LinkItemContents>
    );
  }
  private _renderVideoCard() {
    const { html, title, url } = this.props;
    return (
      <LinkVideoContents>
        <Title data-test-automation-id="linkVideoCardTitle">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </Title>
        {html && <VideoWrapper dangerouslySetInnerHTML={{ __html: html }} />}
      </LinkVideoContents>
    );
  }

  render() {
    const { html, isShowCloseBtn } = this.props;
    return (
      <JuiLinkItemsWrappers
        onLinkItemClose={this.onLinkItemClose}
        isShowCloseBtn={isShowCloseBtn}
      >
        {html ? this._renderVideoCard() : this._renderLinkCard()}
      </JuiLinkItemsWrappers>
    );
  }
}
export { JuiConversationCardLinkItems };
