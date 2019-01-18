/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 10:16:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ChangeEvent, createRef, FocusEventHandler } from 'react';
import * as Jui from './style';

type JuiSearchInputProps = {
  value: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEventHandler<HTMLInputElement>) => void;
  onFocus?: (e: FocusEventHandler<HTMLInputElement>) => void;
  onClear: () => void;
  focus: boolean;
  showCloseBtn: boolean;
};

class JuiSearchInput extends React.Component<JuiSearchInputProps, {}> {
  private _inputDom = createRef<HTMLInputElement>();

  constructor(props: JuiSearchInputProps) {
    super(props);
  }

  onClose = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();

    const { onClear } = this.props;
    const node = this._inputDom.current;
    if (node) {
      node.focus();
    }
    onClear();
  }

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    onChange(e);
  }

  onBlur = (e: FocusEventHandler<HTMLInputElement>) => {
    const { onBlur } = this.props;
    onBlur && onBlur(e);
  }

  blurTextInput = () => {
    const node = this._inputDom.current;
    if (node) {
      node.blur();
    }
  }

  render() {
    const { value, focus, onFocus, placeholder, showCloseBtn } = this.props;

    return (
      <Jui.SearchWrapper hasValue={value} focus={focus}>
        <Jui.SearchIcon
          data-test-automation-id="search-icon"
          disableToolTip={true}
        >
          search
        </Jui.SearchIcon>
        <Jui.SearchInput
          data-test-automation-id="search-input"
          onChange={this.onChange}
          onFocus={onFocus}
          onBlur={this.onBlur}
          inputRef={this._inputDom}
          inputProps={{
            placeholder,
            className: 'search-input',
            maxLength: 200,
          }}
          InputProps={{
            value,
            disableUnderline: true,
          }}
        />
        {showCloseBtn && (
          <Jui.CloseBtn
            disableToolTip={true}
            variant="plain"
            onClick={this.onClose}
          >
            close
          </Jui.CloseBtn>
        )}
      </Jui.SearchWrapper>
    );
  }
}

export { JuiSearchInput };
