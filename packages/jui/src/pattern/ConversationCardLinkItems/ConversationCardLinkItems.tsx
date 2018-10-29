/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import { height, grey, palette, spacing, ellipsis } from '../../foundation/utils/styles';

const LinkItemsWrapper = styled.div`
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 100%;
  box-shadow: 0 1px 1px 0;
  height: 104px;
`;
const LinkItemContents = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 16px;
  height: 72px;
  width: 100%;
`;
const LinkThumbnails = styled.div`
  width: 72px;
  height: 72px;
  background: url(${({ img }) => img}) 72px 72px;
  background-size: cover;
`;
const TitleNSummaryWrapper = styled.div`
  flex: 1;
  width: 0;
  margin-left: 12px;
  span{
    position: absolute;
    right: 16px;
    top: 12px;
    color: #bfbfbf;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
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
`;
type Props = {
  title: string;
  summary: string;
  thumbnail: string;
};
class JuiConversationCardLinkItems extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { title, summary, thumbnail } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <LinkThumbnails img={thumbnail} />
          <TitleNSummaryWrapper>
            <LinkTitle>
              {title}
            </LinkTitle>
            <LinkSummary>
              {summary}
            </LinkSummary>
          </TitleNSummaryWrapper>
          <JuiIconography>close</JuiIconography>
        </LinkItemContents>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardLinkItems };
