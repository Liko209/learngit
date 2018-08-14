import React from 'react';
import styled from 'styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import BasePageHeader, { BasePageHeaderProps } from '../BasePageHeader';

export type PageHeaderProps = {
  title: string,
  leftSlot?: React.ReactNode,
  rightSlot?: React.ReactNode,
} & BasePageHeaderProps;

const LeftWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
`;

const LeftSlotWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-right: 16px;
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-left: 16px;
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

export const CustomPageHeader: React.SFC<PageHeaderProps> = (
  props: PageHeaderProps,
) => {
  const { children, leftSlot, rightSlot, title, innerRef, ...rest } = props;

  const right = rightSlot ? (
    <RightWrapper>
      {rightSlot}
    </RightWrapper>
  ) : null;
  const left = leftSlot ? (
    <LeftSlotWrapper>
      {leftSlot}
    </LeftSlotWrapper>
  ) : null;
  return (
    <BasePageHeader {...rest}>
      <LeftWrapper>
        {left}
        <TitleWrapper variant="title" component="h6">
          {title}
        </TitleWrapper>
      </LeftWrapper>
      {right}
    </BasePageHeader>
  );
};

export const PageHeader = styled<PageHeaderProps>(CustomPageHeader).attrs({})`
  && {
    background-color: #f8f8f8;

    > div {
      padding-left: 16px;
      padding-right: 16px;
    }

    ${LeftWrapper} {
      padding-right: ${props => props.rightSlot ? '20px' : ''};
    }
  }
`;

export default PageHeader;
