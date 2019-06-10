/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CallActionsViewProps } from './types';
import { CALL_ACTION } from '../../interface/constant';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';
import { JuiMenuList } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { Forward } from './Forward';
import { Reply } from './Reply';
import { Park } from './Park';
import { Flip } from './Flip';

type Props = CallActionsViewProps & WithTranslation;

const callActions = {
  [CALL_ACTION.FORWARD]: Forward,
  [CALL_ACTION.REPLY]: Reply,
  [CALL_ACTION.PARK]: Park,
  [CALL_ACTION.FLIP]: Flip,
};

@observer
class CallActionsViewComponent extends Component<Props> {
  private _Anchor = () => {
    const { t, shouldPersistBg, isIncomingPage } = this.props;
    return (
      <JuiIconButton
        color="grey.900"
        shouldPersistBg={shouldPersistBg}
        tooltipPlacement="top"
        tooltipTitle={t('telephony.accessibility.callActions')}
        aria-label={t('telephony.accessibility.callActions')}
        size={shouldPersistBg ? 'xlarge' : 'xxlarge'}
        data-test-automation-id="telephony-call-actions-btn"
        disableToolTip={!isIncomingPage}
      >
        call_more
      </JuiIconButton>
    );
  }

  render() {
    const { t, isIncomingPage, callActionsMap } = this.props;
    return (
      <JuiKeypadAction>
        <JuiPopoverMenu
          Anchor={this._Anchor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <JuiMenuList data-test-automation-id="telephony-more-option-menu">
            {Object.keys(callActions).map((key: string) => {
              const { shouldShowAction } = callActionsMap[key];
              const Component = callActions[key];
              return shouldShowAction && <Component key={key} />;
            })}
          </JuiMenuList>
        </JuiPopoverMenu>
        {!isIncomingPage && <span>{t('telephony.action.callActions')}</span>}
      </JuiKeypadAction>
    );
  }
}

const CallActionsView = withTranslation('translations')(
  CallActionsViewComponent,
);

export { CallActionsView };
