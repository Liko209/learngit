/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import BasePageHeader, { BasePageHeaderProps } from '../BasePageHeader';

type ShelfPageHeaderProps = {
  title?: string,
  Left?: React.ReactNode,
  Right?: React.ReactNode,
} & BasePageHeaderProps;

const StyledShelfPageHeader = styled<ShelfPageHeaderProps>(BasePageHeader)`
  && {
  background-color: ${({ theme }) => theme.palette.grey[50]};

    > div {
      padding-left: ${({ theme }) => theme.spacing.unit * 4}px;
      padding-right: ${({ theme }) => theme.spacing.unit * 4}px;
    }

    .left-section {
      display: flex;
      align-items: center;
      padding-right: ${({ theme }) => theme.spacing.unit * 4}px;
    }

    .left-wrapper {
      display: flex;
      align-items: center;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
      padding-right: ${({ theme, Right }) => Right ? theme.spacing.unit * 5 + 'px' : ''};
    }

    .right-wrapper {
      display: flex;
      align-items: center;
      padding-left: ${({ theme }) => theme.spacing.unit * 4}px;
    }
  }
`;

const TitleWrapper = styled<TypographyProps>(Typography)`
  && {
    font-size: ${({ theme }) => theme.typography.title.fontSize};
    font-weight: ${({ theme }) => theme.typography.title.fontWeight};
    font-family: ${({ theme }) => theme.typography.title.fontFamily};
    color: ${({ theme }) => theme.palette.grey[700]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ShelfPageHeader: React.SFC<ShelfPageHeaderProps> = (
  props: ShelfPageHeaderProps,
) => {
  const { children, Left, Right, title, innerRef, ...rest } = props;

  const right = Right ? (
    <div className="right-wrapper">
      {Right}
    </div>
  ) : null;
  const left = Left ? (
    <div className="left-section">
      {Left}
    </div>
  ) : null;
  return (
    <StyledShelfPageHeader {...rest}>
      <div className="left-wrapper">
        {left}
        <TitleWrapper variant="title" component="h6">
          {title}
        </TitleWrapper>
      </div>
      {right}
    </StyledShelfPageHeader>
  );
};

export { ShelfPageHeader, ShelfPageHeaderProps };
export default ShelfPageHeader;
