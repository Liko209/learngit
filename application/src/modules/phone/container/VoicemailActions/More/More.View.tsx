/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:26:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiPopperMenu, AnchorProps } from 'jui/pattern/PopperMenu';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiMenuList } from 'jui/components/Menus';
import { MoreViewProps } from './types';

type Props = MoreViewProps & WithTranslation;

type State = {
  open: boolean;
  anchorEl: EventTarget | null;
};

@observer
class MoreViewComponent extends Component<Props, State> {
  state = {
    open: false,
    anchorEl: null,
  };

  private _Anchor = ({ tooltipForceHide }: AnchorProps) => {
    const { t } = this.props;
    return (
      <JuiIconButton
        color="grey.500"
        variant="round"
        autoFocus={false}
        size="small"
        key="voicemail-more"
        data-test-automation-id="voicemail-more-button"
        ariaLabel={t('voicemail.more')}
        tooltipTitle={t('voicemail.more')}
        tooltipForceHide={tooltipForceHide}
        onClick={this.openPopper}
      >
        more_horiz
      </JuiIconButton>
    );
  }

  openPopper = (event: MouseEvent) => {
    event.stopPropagation();
    const { currentTarget } = event;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  }

  closePopper = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    const { anchorEl, open } = this.state;
    const { children } = this.props;
    return (
      <JuiPopperMenu
        open={open}
        anchorEl={anchorEl}
        Anchor={this._Anchor}
        placement="bottom-start"
        onClose={this.closePopper}
      >
        <JuiMenuList onClick={this.closePopper}>
          {children}
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }
}

const MoreView = withTranslation('translations')(MoreViewComponent);

export { MoreView };
