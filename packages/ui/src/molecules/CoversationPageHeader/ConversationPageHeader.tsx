/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled, { IDependencies } from '../../styled-components';
import MuiToolbar, { ToolbarProps as MuiToolbarProps } from '@material-ui/core/Toolbar';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@material-ui/core/AppBar';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import { typography, ellipsis, grey, height, spacing } from '../../utils/styles';

type JuiConversationPageHeaderProps = {
  title?: string,
  SubTitle?: React.ReactNode,
  Right?: React.ReactNode,
} & MuiToolbarProps &
  MuiAppBarProps;

const TitleWrapper = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('900')};
    ${typography('title2')}
    ${ellipsis()};
  }
`;
const WrappedAppBar = ({ Right, ...rest }: JuiConversationPageHeaderProps) => (
  <MuiAppBar {...rest} />
);
export const StyledPageHeader = styled<JuiConversationPageHeaderProps>(WrappedAppBar)`
  && {
    min-height: ${height(5.6)};
    padding-left: 0;
    padding-right: 0;
    background-color: white;

    > div {
      min-height: ${height(5.6)};
      padding-left: ${spacing(6)};
      padding-right: ${spacing(6)};
    }

    .left-wrapper {
      display: flex;
      align-items: center;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
    }

    .right-wrapper {
      display: flex;
      align-items: center;
      padding-left: ${({ theme, Right }) => Right ? spacing(3)({ theme }) : ''};
    }

    .subtitle {
      display: flex;
      align-items: center;
      padding-left: ${({ theme }) => spacing(1)({ theme })};
      padding-right: ${({ theme, Right }) => Right ? spacing(3)({ theme }) : ''};
    }
  }
`;

type IJuiConversationPageHeader = React.SFC<JuiConversationPageHeaderProps> & IDependencies;
const JuiConversationPageHeader: IJuiConversationPageHeader = (
  props: JuiConversationPageHeaderProps,
) => {
  const { children, title, SubTitle, Right, innerRef, ...rest } = props;
  const subTitleComponent = (
    <div className="subtitle">
      {SubTitle}
    </div>
  );

  const right = (
    <div className="right-wrapper">
      {Right}
    </div>
  );
  return (
    <StyledPageHeader
      position="static"
      elevation={0}
      square={true}
      Right={Right}
      {...rest}
    >
      <MuiToolbar variant="dense">
        <div className="left-wrapper">
          <TitleWrapper variant="title" component="h6">
            {title}
          </TitleWrapper>
          {SubTitle ? subTitleComponent : null}
        </div>
        {Right ? right : null}
      </MuiToolbar>
    </StyledPageHeader>
  );
};

JuiConversationPageHeader.defaultProps = {
  title: '',
};
JuiConversationPageHeader.dependencies = [MuiAppBar, MuiToolbar, Typography];

export { JuiConversationPageHeader, JuiConversationPageHeaderProps };
export default JuiConversationPageHeader;
