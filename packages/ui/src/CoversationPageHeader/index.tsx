import React from 'react';
import styled from 'styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import BasePageHeader, { BasePageHeaderProps } from '../BasePageHeader';

export type ConversationPageHeaderProps = {
  title: string,
  subTitleSlot?: React.ReactNode,
  rightSlot?: React.ReactNode,
} & BasePageHeaderProps;

const LeftWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-left: 20px;
`;

const TitleWrapper = styled<TypographyProps>(Typography)`
  && {
    font-size: 20px;
    font-weight: 700;
    font-family: 'Roboto', sans-serif;
    color: #616161;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SubTitleWrapper = styled.div`
  padding-left: 12px;
  display: flex;
  align-items: center;
`;

export const CustomPageHeader: React.SFC<ConversationPageHeaderProps> = (
  props: ConversationPageHeaderProps,
) => {
  const { children, subTitleSlot, rightSlot, title, innerRef, ...rest } = props;
  const subTitle = subTitleSlot ? (
    <SubTitleWrapper>
      {subTitleSlot}
    </SubTitleWrapper>
  ) : null;

  const right = rightSlot ? (
    <RightWrapper>
      {rightSlot}
    </RightWrapper>
  ) : null;
  return (
    <BasePageHeader {...rest}>
      <LeftWrapper>
        <TitleWrapper variant="title" component="h6">
          {title}
        </TitleWrapper>
        {subTitle}
      </LeftWrapper>
      {right}
    </BasePageHeader>
  );
};

export const ConversationPageHeader =
  styled<ConversationPageHeaderProps>(CustomPageHeader).attrs({})`
    && {
      background-color: #fff;

      > div {
        padding-left: 24px;
        padding-right: 24px;
      }

      ${LeftWrapper} {
        padding-right: ${props => props.rightSlot ? '20px' : ''};
      }
    }
  `;

export default ConversationPageHeader;
