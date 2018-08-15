import React from 'react';
import styled from 'styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import BasePageHeader, { BasePageHeaderProps } from '../BasePageHeader';

type ShelfPageHeaderProps = {
  title?: string,
  leftSection?: React.ReactNode,
  rightSection?: React.ReactNode,
} & BasePageHeaderProps;

const StyledShelfPageHeader = styled<ShelfPageHeaderProps>(BasePageHeader)`
  && {
    background-color: #f8f8f8;

    > div {
      padding-left: 16px;
      padding-right: 16px;
    }

    .left-section {
      display: flex;
      align-items: center;
      padding-right: 16px;
    }

    .left-wrapper {
      display: flex;
      align-items: center;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
      padding-right: ${(props: ShelfPageHeaderProps) => props.rightSection ? '20px' : ''};
    }

    .right-wrapper {
      display: flex;
      align-items: center;
      padding-left: 16px;
    }
  }
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

const ShelfPageHeader: React.SFC<ShelfPageHeaderProps> = (
  props: ShelfPageHeaderProps,
) => {
  const { children, leftSection, rightSection, title, innerRef, ...rest } = props;

  const right = rightSection ? (
    <div className="right-wrapper">
      {rightSection}
    </div>
  ) : null;
  const left = leftSection ? (
    <div className="left-section">
      {leftSection}
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
