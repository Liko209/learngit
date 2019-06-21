/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiMenuItem, JuiSubMenu } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { ViewProps } from './types';

type Props = ViewProps & WithTranslation;

@observer
class ForwardViewComponent extends React.Component<Props> {
  private _handleForwardMap = {};

  private _handleClick = (phoneNumber: string) => {
    const { forward } = this.props;
    if (this._handleForwardMap[phoneNumber]) {
      return this._handleForwardMap[phoneNumber];
    }
    return (this._handleForwardMap[phoneNumber] = () => forward(phoneNumber));
  }

  render() {
    const {
      t,
      directForward,
      shouldDisableForwardButton,
      forwardCalls,
    } = this.props;
    return (
      <JuiSubMenu
        data-test-automation-id="telephony-forward-menu-item"
        title={t('telephony.action.forward')}
        disabled={shouldDisableForwardButton}
      >
        {forwardCalls &&
          forwardCalls.map(({ phoneNumber, label }) => {
            return (
              <JuiMenuItem key={label} onClick={this._handleClick(phoneNumber)}>
                <JuiListItemText primary={label} secondary={phoneNumber} />
              </JuiMenuItem>
            );
          })}
        <JuiMenuItem onClick={directForward}>
          {t('telephony.action.customForward')}
        </JuiMenuItem>
      </JuiSubMenu>
    );
  }
}

const ForwardView = withTranslation('translations')(ForwardViewComponent);

export { ForwardView };
