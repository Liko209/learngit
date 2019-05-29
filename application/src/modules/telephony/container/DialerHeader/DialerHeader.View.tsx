/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiHeader } from 'jui/pattern/Dialer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DialerHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar';

type Props = DialerHeaderViewProps & WithTranslation;

@observer
class DialerHeaderViewComponent extends React.Component<Props> {
  private _Avatar = () => {
    const { uid } = this.props;
    return (
      <Avatar
        uid={uid}
        showDefaultAvatar={!uid}
        imgProps={{ draggable: false }}
        size="large"
      />
    );
  }

  private _focusOnInput = () => {
    const { shouldDisplayDialer, onFocus } = this.props;
    if (shouldDisplayDialer && onFocus) {
      onFocus();
    }
  }

  componentDidMount() {
    this._focusOnInput();
  }

  render() {
    const {
      name,
      phone,
      isExt,
      t,
      shouldDisplayDialer,
      inputString,
      onFocus,
      onBlur,
      onChange,
      dialerInputFocused,
      deleteLastInputString,
      deleteInputString,
      onKeyDown,
      Back,
    } = this.props;
    return (
      <JuiHeader
        Avatar={this._Avatar}
        name={name ? name : t('telephony.unknownCaller')}
        phone={isExt ? `${t('telephony.Ext')} ${phone}` : phone}
        showDialerInputField={shouldDisplayDialer}
        dialerValue={inputString}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        focus={dialerInputFocused}
        placeholder={t('telephony.dialerPlaceholder')}
        ariaLabelForDelete={t('telephony.delete')}
        deleteLastInputString={deleteLastInputString}
        deleteInputString={deleteInputString}
        onKeyDown={onKeyDown}
        Back={Back}
      />
    );
  }
}

const DialerHeaderView = withTranslation('translations')(
  DialerHeaderViewComponent,
);

export { DialerHeaderView };
