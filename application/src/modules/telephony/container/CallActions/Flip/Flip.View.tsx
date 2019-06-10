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
import { FlipViewProps } from './types';

type Props = FlipViewProps & WithTranslation;

@observer
class FlipViewComponent extends React.Component<Props> {
  private _handleFlip = {};

  private _handleClick = (flipNumber: number) => {
    const { flip } = this.props;
    if (this._handleFlip[flipNumber]) {
      return this._handleFlip[flipNumber];
    }
    return (this._handleFlip[flipNumber] = () => flip(flipNumber));
  }

  render() {
    const { t, flipNumbers, canUseFlip } = this.props;
    if (!canUseFlip) {
      return (
        <JuiMenuItem
          disabled={true}
          data-test-automation-id="telephony-flip-menu-item"
        >
          {t('telephony.action.flip')}
        </JuiMenuItem>
      );
    }

    return (
      <JuiSubMenu
        data-test-automation-id="telephony-flip-menu-item"
        title={t('telephony.action.flip')}
      >
        {flipNumbers.map(({ flipNumber, label, phoneNumber }) => {
          return (
            <JuiMenuItem key={label} onClick={this._handleClick(flipNumber)}>
              <JuiListItemText primary={label} secondary={phoneNumber} />
            </JuiMenuItem>
          );
        })}
      </JuiSubMenu>
    );
  }
}

const FlipView = withTranslation('translations')(FlipViewComponent);

export { FlipView };
