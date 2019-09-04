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
import { JuiIconButton, JuiFabButton } from 'jui/components/Buttons';
import { JuiKeypadAction, StyledActionText } from 'jui/pattern/Dialer';
import { JuiMenuList } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { Forward } from './Forward';
import { Reply } from './Reply';
import { Park } from './Park';
import { Flip } from './Flip';
import { Transfer } from './Transfer';

type Props = CallActionsViewProps & WithTranslation;

const callActions = {
  [CALL_ACTION.FORWARD]: Forward,
  [CALL_ACTION.REPLY]: Reply,
  [CALL_ACTION.PARK]: Park,
  [CALL_ACTION.FLIP]: Flip,
  [CALL_ACTION.TRANSFER]: Transfer,
};

@observer
class CallActionsViewComponent extends Component<Props> {
  private _Anchor = () => {
    const {
      t,
      shouldPersistBg,
      isIncomingPage,
      isWarmTransferPage,
    } = this.props;

    if (isIncomingPage) {
      return (
        <JuiFabButton
          color="grey.200"
          size="medium"
          showShadow={false}
          iconName="call_more"
          tooltipPlacement="top"
          aria-label={t('telephony.accessibility.callActions')}
          data-test-automation-id="telephony-call-actions-btn"
        />
      );
    }

    return (
      <JuiIconButton
        color="grey.900"
        shouldPersistBg={shouldPersistBg}
        tooltipPlacement="top"
        aria-label={t('telephony.accessibility.callActions')}
        size={shouldPersistBg ? 'small' : 'xxlarge'}
        data-test-automation-id="telephony-call-actions-btn"
        disabled={isWarmTransferPage}
      >
        call_more
      </JuiIconButton>
    );
  };

  renderLabel() {
    const { t, isIncomingPage } = this.props;
    return isIncomingPage ? (
      <StyledActionText>{t('telephony.action.more')}</StyledActionText>
    ) : (
      <span>{t('telephony.action.callActions')}</span>
    );
  }

  render() {
    const { callActionsMap, isIncomingPage, isWarmTransferPage } = this.props;
    return (
      <JuiKeypadAction removeMargin={isIncomingPage}>
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
          disabled={isWarmTransferPage}
        >
          <JuiMenuList data-test-automation-id="telephony-more-option-menu">
            {Object.keys(callActions).map((key: string) => {
              const { shouldShowAction } = callActionsMap[key];
              const Component = callActions[key];
              return shouldShowAction && <Component key={key} />;
            })}
          </JuiMenuList>
        </JuiPopoverMenu>
        {this.renderLabel()}
      </JuiKeypadAction>
    );
  }
}

const CallActionsView = withTranslation('translations')(
  CallActionsViewComponent,
);

export { CallActionsView };
