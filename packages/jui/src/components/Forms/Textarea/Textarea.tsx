/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-18 14:00:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';

import {
  typography,
  spacing,
  grey,
  shape,
} from '../../../foundation/utils/styles';

type State = {
  hasValue: boolean;
};

type Props = {
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
} & TextFieldProps;

type Textarea = State & Props;

const WrapperTextField = ({ hasValue, ...rest }: State) => {
  return <MuiTextField {...rest} />;
};

const Textarea = styled<Textarea>(WrapperTextField)`
  && {
    background: ${props => (props.hasValue ? '#fff' : grey('100'))};
    padding: ${({ theme }) => spacing(2)};
    margin: ${spacing(2)} 0 0 0;
    box-sizing: border-box;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: ${props =>
      props.hasValue ? shape('border3') : '1px solid transparent'};
  }
  .input-root {
    padding: 0;
    ${typography('body1')};
  }
`;

class JuiTextarea extends React.Component<Props, State> {
  // static displayName = 'JuiTextarea';
  // static dependencies = [MuiTextField];
  constructor(props: Props) {
    super(props);
    this.state = {
      hasValue: false,
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      hasValue: e.target.value !== '',
    });
    this.props.onChange && this.props.onChange(e);
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyDown } = this.props;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
    }
    onKeyDown && onKeyDown(e);
  }

  render() {
    const { innerRef, rows, ...textFieldRest } = this.props;
    const { hasValue } = this.state;
    const { onChange, ...rest } = textFieldRest;
    return (
      <Textarea
        multiline={true}
        hasValue={hasValue}
        onKeyDown={this.onKeyDown}
        InputProps={{
          disableUnderline: true,
          classes: {
            root: 'input-root',
          },
        }}
        rows={rows || 3}
        onChange={this.handleChange}
        {...rest}
      />
    );
  }
}

export { JuiTextarea };
