import React from 'react';
import styled from 'styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import BasePageHeader, { BasePageHeaderProps } from '../BasePageHeader';

type ConversationPageHeaderProps = {
  title?: string,
  subTitle?: React.ReactNode,
  rightSection?: React.ReactNode,
} & BasePageHeaderProps;

const StyledConversationPageHeader =
  styled<ConversationPageHeaderProps>(BasePageHeader)`
    && {
      background-color: #fff;

      > div {
        padding-left: 24px;
        padding-right: 24px;
      }

      .left-wrapper {
        display: flex;
        align-items: center;
        flex-grow: 1;
        flex-shrink: 1;
        overflow: hidden;
        padding-right: ${(props: ConversationPageHeaderProps) => props.rightSection ? '20px' : ''};
      }

      .right-wrapper {
        display: flex;
        align-items: center;
        padding-left: 20px;
      }

      .subtitle {
        padding-left: 12px;
        display: flex;
        align-items: center;
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

const ConversationPageHeader: React.SFC<ConversationPageHeaderProps> = (
  props: ConversationPageHeaderProps,
) => {
  const { children, subTitle, rightSection, title, innerRef, ...rest } = props;
  const subTitleComponent = subTitle ? (
    <div className="subtitle">
      {subTitle}
    </div>
  ) : null;

  const right = rightSection ? (
    <div className="right-wrapper">
      {rightSection}
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
