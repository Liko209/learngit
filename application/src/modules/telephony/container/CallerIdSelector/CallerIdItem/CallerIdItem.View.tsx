/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:14:48
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { CallerIdItemViewProps } from './types';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiListItemText } from 'jui/components/Lists';
import { withTranslation, WithTranslation } from 'react-i18next';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';

const style = {
  minWidth: 180,
  maxWidth: 288,
};

@observer
class CallerIdItemComponent extends Component<
  CallerIdItemViewProps & WithTranslation
  > {
  render() {
    const {
      phoneNumber,
      onClick,
      selected,
      isTwoLine,
      formattedPhoneNumber,
      label,
      t,
    } = this.props;

    const usageType =
      this.props.usageType === PhoneNumberType.NickName
        ? label
        : t(
          `telephony.phoneNumberType.${this.props.usageType[0].toLowerCase() +
              this.props.usageType.slice(1, this.props.usageType.length)}`,
        );

    return (
      <JuiMenuItem
        value={phoneNumber}
        onClick={onClick}
        selected={selected}
        style={style}
      >
        <JuiListItemText
          primary={usageType}
          key={phoneNumber}
          secondary={isTwoLine && formattedPhoneNumber}
        />
      </JuiMenuItem>
    );
  }
}

const CallerIdItemView = withTranslation('translations')(CallerIdItemComponent);

export { CallerIdItemView };
