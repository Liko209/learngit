/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-13 10:09:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { InputProps } from '@material-ui/core/Input';
import * as Jui from './style';

type IInputProps = {
  label: string;
  error: boolean;
  errorText: string;
} & InputProps;

interface IState {
  text: string;
}

class JuiInput extends React.Component<IInputProps, IState> {
  constructor(props: IInputProps) {
    super(props);
    this.state = {
      text: '',
    };
  }

  render() {
    const {
      label,
      error,
      onChange,
      errorText,
      fullWidth,
      inputProps,
    } = this.props;

    return (
      <Jui.FormControl error={error} fullWidth={fullWidth}>
        <Jui.InputLabel htmlFor="name-error">{label}</Jui.InputLabel>
        <Jui.Input
          inputProps={inputProps}
          value={this.state.text}
          onChange={onChange}
        />
        <Jui.FormHelperText>{errorText}</Jui.FormHelperText>
      </Jui.FormControl>
    );
  }
}

export default JuiInput;
