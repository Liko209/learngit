/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:23:43
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import MuiToolbar, {
  ToolbarProps as MuiToolbarProps,
} from '@material-ui/core/Toolbar';
import MuiAppBar, {
  AppBarProps as MuiAppBarProps,
} from '@material-ui/core/AppBar';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import { JuiArrowTip } from '../../components/Tooltip/ArrowTip';

import {
  typography,
  ellipsis,
  grey,
  height,
  spacing,
} from '../../foundation/utils/styles';
import styled, { Dependencies } from '../../foundation/styled-components';
import { isTextOverflow } from '../../foundation/utils';
import { JuiDivider } from '../../components/Divider/Divider';

type JuiConversationPageHeaderProps = {
  title?: string;
  status?: string | null;
  SubTitle?: React.ReactNode;
  Right?: React.ReactNode;
} & MuiToolbarProps &
  MuiAppBarProps;

const TitleWrapper = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('900')};
    ${typography('title2')};
    ${ellipsis()};
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
const WrappedAppBar = ({ Right, ...rest }: JuiConversationPageHeaderProps) => (
  <MuiAppBar {...rest} />
);
const StyledPageHeader = styled<JuiConversationPageHeaderProps>(WrappedAppBar)`
  && {
    min-height: ${height(12)};
    padding-left: 0;
    padding-right: 0;
    background-color: white;
    > div {
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
  extends React.PureComponent<
    JuiConversationPageHeaderProps,
    { showTooltip: boolean }
  >
  implements IJuiConversationPageHeader {
  textRef: React.RefObject<any>;
  static dependencies = [MuiAppBar, MuiToolbar, JuiArrowTip, Typography];
  static defaultProps = {
    title: '',
  };
  constructor(props: JuiConversationPageHeaderProps) {
    super(props);
    this.state = {
      showTooltip: false,
    };
    this.textRef = React.createRef();
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
  }

  componentDidMount() {
    this.checkShouldTooltipRender();
  }

  private _handleMouseEnter() {
    this.checkShouldTooltipRender();
  }

  checkShouldTooltipRender() {
    const textEl = ReactDOM.findDOMNode(this.textRef.current);

    this.setState({
      showTooltip: textEl instanceof HTMLElement && isTextOverflow(textEl),
    });
  }

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

    const right = <div className="right-wrapper">{Right}</div>;
    const titleElement = (
      <TitleWrapper
        ref={this.textRef}
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
        Right={Right}
        onMouseOver={this._handleMouseEnter}
        {...rest}
      >
        <MuiToolbar variant="dense">
          <div className="left-wrapper">
            <TitleAndStatusWrapper>
              {this.state.showTooltip ? (
                <JuiArrowTip title={title}>{titleElement}</JuiArrowTip>
              ) : (
                titleElement
              )}
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
