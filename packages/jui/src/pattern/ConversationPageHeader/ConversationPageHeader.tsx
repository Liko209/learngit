/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiToolbar, {
  ToolbarProps as MuiToolbarProps,
} from '@material-ui/core/Toolbar';
import MuiAppBar, {
  AppBarProps as MuiAppBarProps,
} from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import { JuiArrowTip } from '../../components/Tooltip/ArrowTip';
import { JuiText, JuiTextProps } from '../../components/Text/Text';

import {
  typography,
  ellipsis,
  grey,
  height,
  spacing,
} from '../../foundation/utils/styles';
import styled, { Dependencies } from '../../foundation/styled-components';
import { JuiDivider } from '../../components/Divider/Divider';

type JuiConversationPageHeaderProps = {
  title?: string;
  status?: string | null;
  SubTitle?: React.ReactNode;
  Right?: React.ReactNode;
} & MuiToolbarProps &
  MuiAppBarProps;

const TitleWrapper = styled<JuiTextProps>(JuiText)`
  && {
    color: ${grey('900')};
    ${typography('title2')};
    padding-right: ${spacing(0.5)};
  }
`;

const StatusWrapper = styled.div`
  ${typography('subheading1')};
  color: ${grey('600')};
  ${ellipsis()};
  padding-left: ${spacing(1.5)};
  padding-right: ${spacing(1.5)};
`;

const StyledPageHeader = styled<JuiConversationPageHeaderProps>(MuiAppBar)`
  && {
    min-height: ${height(12)};
    padding-left: 0;
    padding-right: 0;
    background-color: white;

    > .mui-toolbar {
      min-height: ${height(12)};
      padding-left: ${spacing(4)};
      padding-right: ${spacing(3.5)};
    }

    .left-wrapper {
      display: flex;
      align-items: center;
      flex-grow: 1;
      overflow: hidden;
      padding-right: ${spacing(9.5)};
    }

    .right-wrapper {
      display: flex;
      align-items: center;
    }
  }
`;

const TitleAndStatusWrapper = styled('div')`
  display: flex;
  align-items: baseline;
  overflow: hidden;
`;

type IJuiConversationPageHeader = React.PureComponent<
  JuiConversationPageHeaderProps
> &
  Dependencies;

class JuiConversationPageHeader
  extends React.PureComponent<JuiConversationPageHeaderProps>
  implements IJuiConversationPageHeader {
  static dependencies = [MuiAppBar, MuiToolbar, JuiArrowTip, Typography];
  static defaultProps = {
    title: '',
  };

  render() {
    const {
      children,
      title,
      status,
      SubTitle,
      Right,
      innerRef,
      ...rest
    } = this.props;

    const right = (
      <div className="right-wrapper" id="conversation-header-right-wrapper">
        {Right}
      </div>
    );
    const titleElement = (
      <TitleWrapper
        tooltipTitle={title}
        variant="title"
        component="h6"
        data-test-automation-id="conversation-page-header-title"
      >
        {title}
      </TitleWrapper>
    );
    return (
      <StyledPageHeader
        data-test-automation-id="conversation-page-header"
        position="static"
        elevation={0}
        square={true}
        {...rest}
      >
        <MuiToolbar className="mui-toolbar" variant="dense">
          <div className="left-wrapper">
            <TitleAndStatusWrapper>
              {titleElement}
              {status ? (
                <StatusWrapper data-test-automation-id="conversation-page-header-status">
                  {status}
                </StatusWrapper>
              ) : null}
            </TitleAndStatusWrapper>
            {SubTitle ? SubTitle : null}
          </div>
          {Right ? right : null}
        </MuiToolbar>
        <JuiDivider />
      </StyledPageHeader>
    );
  }
}

export { JuiConversationPageHeader, JuiConversationPageHeaderProps };
