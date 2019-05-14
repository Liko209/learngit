/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CallActionsViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';
import { JuiMenuItem, JuiMenuList } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';

type Props = CallActionsViewProps & WithTranslation;

@observer
class CallActionsViewComponent extends Component<Props> {
  static defaultProps = { showLabel: true };

  private _Anchor = () => {
    const { t, shouldPersistBg } = this.props;
    return (
      <JuiIconButton
        color="grey.900"
        shouldPersistBg={shouldPersistBg}
        tooltipPlacement="top"
        tooltipTitle={t('telephony.moreOptions')}
        aria-label={t('telephony.moreOptions')}
        size={shouldPersistBg ? 'xlarge' : 'xxlarge'}
        data-test-automation-id="telephony-call-actions-btn"
      >
        call_more
      </JuiIconButton>
    );
  }

  private _RenderReplyCall() {
    const { t } = this.props;
    return (
      <JuiMenuItem
        onClick={this._handleReplyActions}
        data-test-automation-id="telephony-reply-menu-item"
      >
        {t('telephony.action.reply')}
      </JuiMenuItem>
    );
  }

  private _handleReplyActions = () => {
    const { directReply } = this.props;
    directReply();
  }

  render() {
    const { t, showLabel } = this.props;
    return (
      <JuiKeypadAction>
        <JuiPopoverMenu
          Anchor={this._Anchor}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <JuiMenuList data-test-automation-id="telephony-more-option-menu">
            {this._RenderReplyCall()}
          </JuiMenuList>
        </JuiPopoverMenu>
        {showLabel && <span>{t('telephony.action.callActions')}</span>}
      </JuiKeypadAction>
    );
  }
}

const CallActionsView = withTranslation('translations')(
  CallActionsViewComponent,
);

export { CallActionsView };
