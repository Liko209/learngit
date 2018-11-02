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
import MuiTooltip from '@material-ui/core/Tooltip';

import {
  typography,
  ellipsis,
  grey,
  height,
  spacing,
} from '../../foundation/utils/styles';
import styled, { Dependencies } from '../../foundation/styled-components';
import { isTextOverflow } from '../../foundation/utils';
import { JuiDivider } from 'jui/src/components/Divider/Divider';

type JuiConversationPageHeaderProps = {
  title?: string;
  SubTitle?: React.ReactNode;
  Right?: React.ReactNode;
} & MuiToolbarProps &
  MuiAppBarProps;

const TitleWrapper = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('900')};
    ${typography('title2')};
    ${ellipsis()};
  }
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
    z-index: ${({ theme }) => `${theme.zIndex.drawer + 10}`};
    > div {
      min-height: ${height(12)};
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
      padding-left: ${({ theme, Right }) =>
        Right ? spacing(3)({ theme }) : ''};
    }

    .subtitle {
      display: flex;
      align-items: center;
      overflow: hidden;
      flex: 1;
      padding-left: ${({ theme }) => spacing(2)({ theme })};
      padding-right: ${({ theme, Right }) =>
        Right ? spacing(12)({ theme }) : ''};
    }
  }
`;

type IJuiConversationPageHeader = React.Component<
  JuiConversationPageHeaderProps
> &
  Dependencies;

class JuiConversationPageHeader
  extends React.Component<
    JuiConversationPageHeaderProps,
    { showTooltip: boolean }
  >
  implements IJuiConversationPageHeader {
  textRef: React.RefObject<any>;
  static dependencies = [MuiAppBar, MuiToolbar, MuiTooltip, Typography];
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
    const { children, title, SubTitle, Right, innerRef, ...rest } = this.props;
    const subTitleComponent = <div className="subtitle">{SubTitle}</div>;

    const right = <div className="right-wrapper">{Right}</div>;
    const titleElement = (
      <TitleWrapper ref={this.textRef} variant="title" component="h6">
        {title}
      </TitleWrapper>
    );
    return (
      <StyledPageHeader
        position="static"
        elevation={0}
        square={true}
        Right={Right}
        onMouseOver={this._handleMouseEnter}
        {...rest}
      >
        <MuiToolbar variant="dense">
          <div className="left-wrapper">
            {this.state.showTooltip ? (
              <MuiTooltip title={title}>{titleElement}</MuiTooltip>
            ) : (
              titleElement
            )}
            {SubTitle ? subTitleComponent : null}
          </div>
          {Right ? right : null}
        </MuiToolbar>
        <JuiDivider />
      </StyledPageHeader>
    );
  }
}

export { JuiConversationPageHeader, JuiConversationPageHeaderProps };
