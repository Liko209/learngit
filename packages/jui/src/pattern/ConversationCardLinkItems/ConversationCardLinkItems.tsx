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
  //border: 1px solid rgba(0, 0, 0, 0.2);
  width: 100%;
  box-shadow: 0 1px 1px 0;
`;
const LinkItemContents = styled.div`
  display: flex;
  padding: 16px;
`;
const LinkThumbnails = styled.div`
  width: 72px;
  height: 72px;
  img {
    width: 72px;
    height: 72px;
  }
`;
const TitleNSummaryWrapper = styled.div`
  width: 100%;
  //float: left;
  margin-left: 12px;
  font-size: 16px;
`;
const LinkTitle = styled.p`
  position: relative;
  margin-top: 0;
  color: #212121;
  ${ellipsis()}
  span{
    position: absolute;
    right: 0;
    color: #bfbfbf;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;
const LinkSummary = styled.p`
  font-size: 14px;
  height: 40px;
  color: #9e9e9e;
  ${ellipsis()};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
          <LinkThumbnails>
            <img src={thumbnail} alt=""/>
          </LinkThumbnails>
          <TitleNSummaryWrapper>
            <LinkTitle>
              {title}
              <JuiIconography>close</JuiIconography>
            </LinkTitle>
            <LinkSummary>
              {summary}
            </LinkSummary>
          </TitleNSummaryWrapper>
        </LinkItemContents>
      </LinkItemsWrapper>
    );
  }
}
export { JuiConversationCardLinkItems };
