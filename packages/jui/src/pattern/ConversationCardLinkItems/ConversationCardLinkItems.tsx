/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import {
  ellipsis,
  width,
  height,
  spacing,
  grey,
} from '../../foundation/utils/styles';
import defaultLinkImage  from './link_img@2x.png';

const LinkItemsWrapper = styled.div`
  margin-top: ${spacing(3)};
  background-color: ${({ theme }) => theme.palette.common.white};
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 100%;
  box-shadow: ${({ theme }) => theme.boxShadow.val1};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  height: ${height(26)};
  overflow: hidden;
  :hover{
    background-color: ${grey('100')};
  }
`;
const LinkItemContents = styled.div`
  display: flex;
  margin: ${spacing(4)};
  height: ${height(18)};
  width: 100%;
  span {
    margin-right: ${spacing(9)};
    color: ${({ theme }) => theme.palette.accent.ash};
    width: ${width(5)};
    height: ${height(5)};
    cursor: pointer;
    margin-top: ${spacing(-1)};
  }
`;
const LinkThumbnails = styled<{img: string}, 'div'>('div')`
  width: ${width(18)};
  height: ${height(18)};
  background: no-repeat center url(${({ img }) => img});
  background-size: cover;
`;
const TitleNSummaryWrapper = styled.div`
  flex: 1;
  margin-left: ${spacing(3)};
  width: 0;
  max-width: 100%;
`;
const LinkTitle = styled.p`
  margin-top: 0;
  ${ellipsis()};
  margin-right: ${spacing(5)};
  a {
    color: ${grey('900')};
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
  line-height: ${({ theme }) => theme.typography.heading1.lineHeight};/* firefox */
  max-height: ${({ theme }) => theme.typography.heading1.maxHeight};       /* firefox */
`;
type Props = {
  title: string;
  summary: string;
  thumbnail: string;
  onLinkItemClose?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  url: string;
};
class JuiConversationCardLinkItems extends PureComponent<
  Props
> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { title, summary, thumbnail, onLinkItemClose, url } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <LinkThumbnails img={thumbnail ? thumbnail : defaultLinkImage} />
          <TitleNSummaryWrapper>
            <LinkTitle>
              <a href={url} target="_blank">{title}</a>
            </LinkTitle>
            <LinkSummary>{summary}</LinkSummary>
          </TitleNSummaryWrapper>
          <JuiIconography onClick={onLinkItemClose}>close</JuiIconography>
        </LinkItemContents>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardLinkItems };
