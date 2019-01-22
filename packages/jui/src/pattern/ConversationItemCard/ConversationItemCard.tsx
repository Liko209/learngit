/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 09:47:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
import { JuiCardContent, JuiCard } from '../../components/Cards';
import { spacing, typography, palette } from '../../foundation/utils/styles';
import { Palette } from 'jui/foundation/theme/theme';
import { getAccentColor } from 'jui/foundation/utils';

const ItemCardWrapper = styled(JuiCard)`
  word-break: break-word;
  margin-bottom: ${spacing(3)};
`;

const ItemIcon = styled(JuiIconography)`
  && {
    font-size: ${spacing(5)};
  }
`;

const ItemTitle = styled<{ complete?: boolean }, 'span'>('span')`
  margin: ${spacing(0, 0, 0, 1)};
  text-decoration: ${({ complete }) => (complete ? 'line-through' : '')};
`;

const ItemCardHeader = styled<
  {
    titleColor?: [keyof Palette, string];
  },
  'div'
>('div')`
  padding: 0;
  margin: ${spacing(0, 0, 0, -6)};
  display: flex;
  ${typography('body1')};
  color: ${({ titleColor }) => getAccentColor(titleColor)};
  word-break: break-word;
  svg {
    font-size: ${spacing(5)};
    margin: ${spacing(0.5)} 0 0;
  }
`;

const ItemCardContent = styled(JuiCardContent)`
  && {
    padding: ${spacing(4, 4, 5, 10)} !important;
    ${typography('body1')};
  }
`;

const ItemCardFooter = styled<{ footerPadding: boolean }, 'footer'>('footer')`
  margin-top: ${spacing(-2)};
  padding: ${({ footerPadding }) => footerPadding && spacing(4, 10, 4, 10)};
  ${typography('body1')};
  background-color: ${palette('grey', '100')};
  .task-avatar-name {
    margin-top: 0;
  }
`;

type JuiConversationItemCardProps = {
  title?: string | JSX.Element;
  Icon: JSX.Element | string;
  titleColor?: [keyof Palette, string];
  titleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  Footer?: JSX.Element | null;
  footerPadding?: boolean;
  complete?: boolean;
};

class JuiConversationItemCard extends React.Component<
  JuiConversationItemCardProps
> {
  titleHandle = (e: React.MouseEvent<HTMLElement>) => {
    const { titleClick } = this.props;
    titleClick && titleClick(e);
  }

  render() {
    const {
      children,
      title,
      Icon,
      Footer,
      footerPadding = true,
      titleColor,
      complete,
    } = this.props;

    return (
      <ItemCardWrapper className="conversation-item-cards">
        <ItemCardContent>
          <ItemCardHeader onClick={this.titleHandle} titleColor={titleColor}>
            {typeof Icon === 'string' ? <ItemIcon>{Icon}</ItemIcon> : Icon}
            {title && <ItemTitle complete={complete}>{title}</ItemTitle>}
          </ItemCardHeader>
          {children}
        </ItemCardContent>
        {Footer && (
          <ItemCardFooter footerPadding={footerPadding}>
            {Footer}
          </ItemCardFooter>
        )}
      </ItemCardWrapper>
    );
  }
}

export { JuiConversationItemCard };
