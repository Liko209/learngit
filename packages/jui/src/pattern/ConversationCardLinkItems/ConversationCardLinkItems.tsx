/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:19:02
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
import { Theme } from '../../foundation/theme/theme';
import defaultLinkImage from './link_img@2x.png';
import { withHighlight } from '../../hoc/withHighlight';

const LinkItemsWrapper = styled(JuiCard)`
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

function getMaxHeight(lineHeight: any, lineNumber: number) {
  const heightNumber: number = Number(lineHeight.replace(/[^-\d\.]/g, ''));
  const unit: string = lineHeight.replace(/[-\d\.]/g, '');
  return `${heightNumber * lineNumber}${unit}`;
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
class JuiConversationCardLinkItemsComponent extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  onLinkItemClose = (event: React.MouseEvent<HTMLElement>) => {
    const { onLinkItemClose } = this.props;
    event.stopPropagation();
    onLinkItemClose && onLinkItemClose(event);
  }
  render() {
    const { title, summary, thumbnail, url, favicon, faviconName } = this.props;
    return (
      <LinkItemsWrapper>
        <LinkItemContents>
          <LinkThumbnails img={thumbnail ? thumbnail : defaultLinkImage} />
          <TitleWithSummary>
            <TitleNSummaryWrapper>
              <LinkTitle>
                <a
                  href={url}
                  target="_blank"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              </LinkTitle>
              <LinkSummary dangerouslySetInnerHTML={{ __html: summary }} />
            </TitleNSummaryWrapper>
            <FaviconWrapper>
              <Favicon favicon={favicon} />
              <FaviconName>{faviconName}</FaviconName>
            </FaviconWrapper>
          </TitleWithSummary>
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

const JuiConversationCardLinkItems = withHighlight(['title', 'summary'])(
  JuiConversationCardLinkItemsComponent,
);
export { JuiConversationCardLinkItems };
