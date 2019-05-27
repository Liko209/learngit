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
    const { t, shouldPersistBg, shouldDisableCallActions } = this.props;
    return (
      <JuiIconButton
        color="grey.900"
        shouldPersistBg={shouldPersistBg}
        tooltipPlacement="top"
        tooltipTitle={t('telephony.moreOptions')}
        aria-label={t('telephony.moreOptions')}
        size={shouldPersistBg ? 'xlarge' : 'xxlarge'}
        data-test-automation-id="telephony-call-actions-btn"
        disabled={shouldDisableCallActions}
        disableToolTip={shouldDisableCallActions}
      >
        call_more
      </JuiIconButton>
    );
  }

  render() {
    const { t, showLabel, callActions, shouldDisableCallActions } = this.props;
    return (
      <JuiKeypadAction>
        {!shouldDisableCallActions ? (
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
              {callActions.map(
                callAction =>
                  !callAction.disabled && (
                    <JuiMenuItem
                      onClick={callAction.handleClick}
                      data-test-automation-id={`telephony-${
                        callAction.label
                      }-menu-item`}
                    >
                      {t(`telephony.action.${callAction.label}`)}
                    </JuiMenuItem>
                  ),
              )}
            </JuiMenuList>
          </JuiPopoverMenu>
        ) : (
          this._Anchor()
        )}
        {showLabel && <span>{t('telephony.action.callActions')}</span>}
      </JuiKeypadAction>
    );
  }
}

const CallActionsView = withTranslation('translations')(
  CallActionsViewComponent,
);

export { CallActionsView };
