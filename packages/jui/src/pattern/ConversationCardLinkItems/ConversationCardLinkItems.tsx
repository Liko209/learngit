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
} from '../../foundation/utils/styles';
import defaultLinkImage  from './link_img@2x.png';

const LinkItemsWrapper = styled.div`
  margin-top: 12px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 100%;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 0 2px 0 rgba(0, 0, 0, 0.14);
  border-radius: 4px;
  height: 104px;
  :hover{
    background-color: #f5f5f5;
  }
`;
const LinkItemContents = styled.div`
  display: flex;
  margin: 16px;
  height: 72px;
  width: 100%;
  span {
    margin-right: 36px;
    color: #bfbfbf;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;
const LinkThumbnails = styled<{img: string}, 'div'>('div')`
  width: 72px;
  height: 72px;
  background: url(${({ img }) => img}) 72px 72px;
  background-size: cover;
`;
const TitleNSummaryWrapper = styled.div`
  flex: 1;
  margin-left: 12px;
`;
const LinkTitle = styled.p`
  margin-top: 0;
  color: #212121;
  ${ellipsis()};
  margin-right: 20px;
`;
const LinkSummary = styled.p`
  font-size: 14px;
  color: #9e9e9e;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-top: -4px;
`;
type Props = {
  title: string;
  summary: string;
  thumbnail: string;
  onLinkItemClick: (e: React.MouseEvent<HTMLSpanElement>) => void;
};
class JuiConversationCardLinkItems extends PureComponent<
  Props
> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { title, summary, thumbnail, onLinkItemClick } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <LinkThumbnails img={thumbnail ? thumbnail : defaultLinkImage} />
          <TitleNSummaryWrapper>
            <LinkTitle>{title}</LinkTitle>
            <LinkSummary>{summary}</LinkSummary>
          </TitleNSummaryWrapper>
          <JuiIconography onClick={onLinkItemClick}>close</JuiIconography>
        </LinkItemContents>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardLinkItems };
