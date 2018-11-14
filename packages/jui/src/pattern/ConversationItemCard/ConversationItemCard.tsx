/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 09:47:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiIcon from '@material-ui/core/Icon';
import styled from '../../foundation/styled-components';
import { JuiCardContent, JuiCard } from '../../components/Cards';
import { spacing, typography, palette } from '../../foundation/utils/styles';

const ItemCardWrapper = styled(JuiCard)``;

const ItemIcon = styled(MuiIcon)`
  && {
    font-size: ${spacing(5)};
  }
`;

const ItemTitle = styled<{ complete?: boolean }, 'span'>('span')`
  margin: ${spacing(0, 0, 0, 1)};
  text-decoration: ${({ complete }) => (complete ? 'line-through' : '')};
`;

const ItemCardHeader = styled.div`
  padding: 0;
  margin: ${spacing(0, 0, 2, -6)};
  display: flex;
  ${typography('subheading3')};
  color: ${({ color }) => color || palette('primary', 'main')};
`;

const ItemCardContent = styled(JuiCardContent)`
  && {
    padding: ${spacing(4, 10, 5, 10)} !important;
    ${typography('subheading3')};
  }
`;

const ItemCardFooter = styled<{ footerPadding: boolean }, 'footer'>('footer')`
  padding: ${({ footerPadding }) => footerPadding && spacing(4, 10, 5, 10)};
  ${typography('subheading3')};
  background-color: ${palette('grey', '100')};
`;

type JuiConversationItemCardProps = {
  title: string | JSX.Element;
  icon: JSX.Element | string;
  titleColor?: string;
  titleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
  footer?: JSX.Element | null;
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
      icon: Icon,
      footer,
      footerPadding = true,
      titleColor,
      complete,
    } = this.props;

    return (
      <ItemCardWrapper>
        <ItemCardContent>
          <ItemCardHeader onClick={this.titleHandle} color={titleColor}>
            {typeof Icon === 'string' ? <ItemIcon>{Icon}</ItemIcon> : Icon}
            <ItemTitle complete={complete}>{title}</ItemTitle>
          </ItemCardHeader>
          {children}
        </ItemCardContent>
        {footer && (
          <ItemCardFooter footerPadding={footerPadding}>
            {footer}
          </ItemCardFooter>
        )}
      </ItemCardWrapper>
    );
  }
}

export { JuiConversationItemCard };
