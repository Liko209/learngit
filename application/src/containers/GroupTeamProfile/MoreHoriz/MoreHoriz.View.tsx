/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { JuiIconography } from 'jui/foundation/Iconography';
import { JuiMenu, JuiMenuItem } from 'jui/components';
import { MoreHorizProps } from './types';

@observer
class MoreHorizView extends React.Component<MoreHorizProps> {
  menuAnchorEl: HTMLElement | null = null;
  state = {
    isShowCopyMenu: false,
  };
  private _onMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.menuAnchorEl = event.currentTarget;
    this.setState({
      isShowCopyMenu: !this.state.isShowCopyMenu,
    });
  }
  private _onEmailCopied = () => {
    document.execCommand('copy');
    this.setState({
      isShowCopyMenu: false,
    });
  }
  private _onUrlCopied = () => {
    this.setState({
      isShowCopyMenu: false,
    });
  }
  render() {
    const { isShowCopyMenu } = this.state;
    // const {} = this.props;
    return (
      <>
        <JuiIconography
          onClick={this._onMenuClick}
        >
          more_horiz
        </JuiIconography>
        <JuiMenu open={isShowCopyMenu} anchorEl={this.menuAnchorEl}>
          <JuiMenuItem onClick={this._onEmailCopied}>copy email</JuiMenuItem>
          <JuiMenuItem onClick={this._onUrlCopied}>copy url</JuiMenuItem>
        </JuiMenu>
      </>
    );
  }
}
export { MoreHorizView };
