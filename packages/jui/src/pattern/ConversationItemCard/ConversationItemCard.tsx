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
import { omit } from 'lodash';
import { JuiIconButton } from '../../components/Buttons';
import {
  JuiButtonBar,
  JuiButtonBarProps,
} from '../../components/Buttons/ButtonBar';
import { Palette } from '../../foundation/theme/theme';

type CustomColor = [keyof Palette, string];

const ItemCardWrapper = styled(JuiCard)`
  word-break: break-word;
  margin-bottom: ${spacing(3)};
`;

const ItemTitle = styled<
  { complete?: boolean; customColor?: CustomColor },
  'span'
>('span')`
  flex-grow: 1;
  margin: ${spacing(0, 0, 0, 1)};
  text-decoration: ${({ complete }) => (complete ? 'line-through' : '')};
  color: ${({ customColor }) =>
    customColor ? palette(customColor[0], customColor[1]) : null};
`;

const SubTitle = styled.span`
  color: ${palette('text', 'secondary')};
  flex-grow: 2;
`;
const HeaderActionsWrapper = styled(JuiButtonBar) <JuiButtonBarProps>`
  position: absolute;
  right: ${spacing(1.5)};
  top: ${spacing(1.5)};
`;

type HeaderAction = {
  iconName: string;
  tooltip: string;
  handler: React.MouseEventHandler;
};

function calcActionBarWith(buttonNumber: number) {
  const margin = 6;
  const buttonWidth = 40;
  const overlapSize = 8;
  return (
    buttonNumber * buttonWidth - (buttonNumber - 1) * overlapSize + margin * 2
  );
}

type ItemCardProps = {
  buttonNumber: number;
};
const ItemCardHeader = styled.div<ItemCardProps>`
  position: relative;
  padding: ${spacing(4)};
  padding-right: ${({ buttonNumber }) => calcActionBarWith(buttonNumber)}px;
  display: flex;
  ${typography('body1')};
  color: ${palette('text', 'primary')};
  word-break: break-word;
  svg {
    font-size: ${spacing(5)};
  }
`;

const ItemCardContent = styled(props => (
  <JuiCardContent {...omit(props, ['hasPadding'])} />
)) <{ hasPadding: boolean }>`
  &&& {
    padding: ${({ hasPadding }) =>
    hasPadding ? spacing(0, 4, 5, 10) : spacing(0, 0, 0, 0)};
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
  title?: React.ReactChild | (React.ReactChild | null)[] | null;
  Icon: JSX.Element | string;
  customColor?: CustomColor;
  iconColor?: CustomColor;
  titleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  contentHasPadding?: boolean;
  isShowLoading?: boolean;
  subTitle?: JSX.Element;
  Footer?: JSX.Element | null;
  footerPadding?: boolean;
  complete?: boolean;
  headerActions?: HeaderAction[];
  showHeaderActions?: boolean;
} & React.DOMAttributes<{}>;

class JuiConversationItemCard extends React.PureComponent<
  JuiConversationItemCardProps
  > {
  titleHandle = (e: React.MouseEvent<HTMLElement>) => {
    const { titleClick } = this.props;
    titleClick && titleClick(e);
  };

  render() {
    const {
      children,
      title,
      Icon,
      customColor,
      iconColor = ['primary', 'main'] as [keyof Palette, string],
      Footer,
      footerPadding = true,
      contentHasPadding = true,
      complete,
      headerActions,
      showHeaderActions,
      isShowLoading = false,
      subTitle,
      ...rest
    } = this.props;
    return (
      <ItemCardWrapper className="conversation-item-cards" {...rest}>
        <ItemCardHeader
          onClick={this.titleHandle}
          buttonNumber={headerActions ? headerActions.length : 0}
        >
          {typeof Icon === 'string' ? (
            <JuiIconography
              iconColor={iconColor}
              iconSize="medium"
              useLoading={isShowLoading}
            >
              {Icon}
            </JuiIconography>
          ) : (
              Icon
            )}
          {title ? (
            <ItemTitle
              data-test-automation-id="conversation-item-cards-title"
              complete={complete}
              customColor={customColor}
            >
              {title}
            </ItemTitle>
          ) : null}
          {subTitle ? (
            <SubTitle
              data-id="subTitle"
              data-test-automation-id="conversation-item-cards-subtitle"
            >
              {subTitle}
            </SubTitle>
          ) : null}
          {showHeaderActions && headerActions && (
            <HeaderActionsWrapper overlapSize={2}>
              {headerActions.map((headerAction: HeaderAction) => (
                <JuiIconButton
                  key={headerAction.iconName}
                  onClick={headerAction.handler}
                  tooltipTitle={headerAction.tooltip}
                  date-test-automation-id={headerAction.iconName}
                >
                  {headerAction.iconName}
                </JuiIconButton>
              ))}
            </HeaderActionsWrapper>
          )}
        </ItemCardHeader>
        {children ? (
          <ItemCardContent hasPadding={contentHasPadding}>
            {children}
          </ItemCardContent>
        ) : null}
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
