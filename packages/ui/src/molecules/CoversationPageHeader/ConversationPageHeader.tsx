import React from 'react';
import styled from '../../styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import BasePageHeader, { BasePageHeaderProps } from '../BasePageHeader';

type ConversationPageHeaderProps = {
  title?: string,
  SubTitle?: React.ReactNode,
  Right?: React.ReactNode,
} & BasePageHeaderProps;

const StyledConversationPageHeader =
  styled<ConversationPageHeaderProps>(BasePageHeader)`
    && {
    background-color: ${({ theme }) => theme.palette.background.paper};

      > div {
        padding-left: ${({ theme }) => theme.spacing.unit * 6 + 'px'};
        padding-right: ${({ theme }) => theme.spacing.unit * 6 + 'px'};
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
        padding-left: ${({ theme }) => theme.spacing.unit * 5 + 'px'};
      }

      .subtitle {
        padding-left: ${({ theme }) => theme.spacing.unit * 3 + 'px'};
        display: flex;
        align-items: center;
      }
    }
  `;

const TitleWrapper = styled<TypographyProps>(Typography)`
  && {
    font-size: ${({ theme }) => theme.typography.title.fontSize};
    font-weight: ${({ theme }) => theme.typography.title.fontWeight};
    font-family: ${({ theme }) => theme.typography.title.fontFamily};
    color: ${({ theme }) => theme.palette.grey[900]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ConversationPageHeader: React.SFC<ConversationPageHeaderProps> = (
  props: ConversationPageHeaderProps,
) => {
  const { children, SubTitle, Right, title, innerRef, ...rest } = props;
  const subTitleComponent = SubTitle ? (
    <div className="subtitle">
      {SubTitle}
    </div>
  ) : null;

  const right = Right ? (
    <div className="right-wrapper">
      {Right}
    </div>
  ) : null;
  return (
    <StyledConversationPageHeader {...rest}>
      <div className="left-wrapper">
        <TitleWrapper variant="title" component="h6">
          {title}
        </TitleWrapper>
        {subTitleComponent}
      </div>
      {right}
    </StyledConversationPageHeader>
  );
};

export { ConversationPageHeader, ConversationPageHeaderProps };
export default ConversationPageHeader;
