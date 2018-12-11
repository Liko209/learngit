/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import { width, height, spacing, grey } from '../../foundation/utils/styles';
import defaultLinkImage from './link_img@2x.png';

const LinkItemsWrapper = styled.div`
  margin-top: ${spacing(3)};
  background-color: ${({ theme }) => theme.palette.common.white};
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 100%;
  box-shadow: ${({ theme }) => theme.boxShadow.val1};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  /* height: ${height(26)}; */
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
const LinkSummary = styled.p`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${grey('500')};
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-top: ${spacing(-1)};
  line-height: ${({ theme }) =>
    theme.typography.heading1.lineHeight}; /* firefox */
  max-height: ${({ theme }) =>
    theme.typography.heading1.maxHeight}; /* firefox */
`;

const FaviconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Favicon = styled.span<{ favicon: string }>`
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

type Props = {
  title: string;
  summary: string;
  thumbnail: string;
  onLinkItemClose?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  url: string;
  favicon: string;
  faviconName: string;
};
class JuiConversationCardLinkItems extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const {
      title,
      summary,
      thumbnail,
      onLinkItemClose,
      url,
      favicon,
      faviconName,
    } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <LinkThumbnails img={thumbnail ? thumbnail : defaultLinkImage} />
          <TitleWithSummary>
            <TitleNSummaryWrapper>
              <LinkTitle>
                <a href={url} target="_blank">
                  {title}
                </a>
              </LinkTitle>
              <LinkSummary>{summary}</LinkSummary>
            </TitleNSummaryWrapper>
            <FaviconWrapper>
              <Favicon favicon={favicon} />
              <FaviconName>{faviconName}</FaviconName>
            </FaviconWrapper>
          </TitleWithSummary>
          <JuiIconography onClick={onLinkItemClose}>close</JuiIconography>
        </LinkItemContents>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardLinkItems };
