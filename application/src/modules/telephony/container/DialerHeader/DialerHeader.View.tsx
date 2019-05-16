/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef, RefObject } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { JuiHeader } from 'jui/pattern/Dialer';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DialerHeaderViewProps } from './types';
import { Avatar } from '@/containers/Avatar';
import { isFunction } from 'lodash';

// HACK: `HTMLInputElement | any` to fix `createTextRange` missing in standard HTML spec
const focusCampo = (inputField: HTMLInputElement | any) => {
  inputField.blur();
  if (inputField && inputField.value.length === 0) {
    return;
  }
  if (isFunction(inputField.createTextRange as any)) {
    const FieldRange = (inputField.createTextRange as Function)();
    FieldRange.moveStart('character', inputField.value.length);
    FieldRange.collapse();
    FieldRange.select();
  } else if (inputField.selectionStart || inputField.selectionStart === 0) {
    const elemLen = inputField.value.length;
    inputField.selectionStart = elemLen;
    inputField.selectionEnd = elemLen;
  }
  requestAnimationFrame(() => {
    inputField && inputField.focus();
  });
};

type Props = DialerHeaderViewProps & WithTranslation;

@observer
class DialerHeaderViewComponent extends React.Component<Props> {
  private _inputRef: RefObject<any> = createRef();

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

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.inputString !== undefined &&
      nextProps.inputString !== this.props.inputString &&
      this._inputRef &&
      this._inputRef.current
    ) {
      const input = (ReactDOM.findDOMNode(
        this._inputRef.current,
      ) as HTMLDivElement).querySelector('input');
      input && focusCampo(input);
    }
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
        ref={this._inputRef}
      />
    );
  }
}

const DialerHeaderView = withTranslation('translations')(
  DialerHeaderViewComponent,
);

export { DialerHeaderView };
