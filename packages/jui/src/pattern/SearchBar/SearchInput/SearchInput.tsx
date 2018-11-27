/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 10:16:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ChangeEvent, createRef, FocusEventHandler } from 'react';
import * as Jui from './style';

type JuiSearchInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEventHandler<HTMLInputElement>) => void;
  onFocus?: (e: FocusEventHandler<HTMLInputElement>) => void;
  onClear: () => void;
  focus: boolean;
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

  render() {
    const { value, focus, onFocus, onBlur } = this.props;

    return (
      <Jui.SearchWrapper focus={focus}>
        <Jui.SearchIcon>search</Jui.SearchIcon>
        <Jui.SearchInput
          onChange={this.onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          inputRef={this._inputDom}
          InputProps={{
            value,
            disableUnderline: true,
          }}
        />
        <Jui.CloseBtn onClick={this.onClose}>close</Jui.CloseBtn>
      </Jui.SearchWrapper>
    );
  }
}

export { JuiSearchInput };
