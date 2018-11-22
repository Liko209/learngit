/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 10:16:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ChangeEvent } from 'react';
import * as Jui from './style';

type State = {
  focus: boolean;
};

type JuiSearchInputProps = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

class JuiSearchInput extends React.Component<JuiSearchInputProps, State> {
  state = {
    focus: false,
  };

  constructor(props: JuiSearchInputProps) {
    super(props);
  }

  onFocus = () => {
    this.setState({
      focus: true,
    });
  }

  onBlur = () => {
    this.setState({
      focus: false,
    });
  }

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    onChange(e);
  }

  render() {
    const { focus } = this.state;

    return (
      <Jui.SearchWrapper focus={focus}>
        <Jui.SearchIcon>search</Jui.SearchIcon>
        <Jui.SearchInput
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          InputProps={{
            disableUnderline: true,
          }}
        />
        <Jui.CloseBtn>close</Jui.CloseBtn>
      </Jui.SearchWrapper>
    );
  }
}

export { JuiSearchInput };
