/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-18 14:00:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';

import { typography, spacing, grey, border } from '../../utils/styles';

type IState = {
  hasValue: boolean;
};

type IProps = {
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
} & TextFieldProps;

type ITextarea = IState & IProps;

const WrapperTextField = ({ hasValue, ...rest }: IState) => {
  return <MuiTextField {...rest} />;
};

const Textarea = styled<ITextarea>(WrapperTextField)`
  && {
    background: ${props => (props.hasValue ? '#fff' : grey('100'))};
    padding: ${({ theme }) => spacing(2)};
    box-sizing: border-box;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    ${props => (props.hasValue ? border('type1') : null)};
  }
  .input-root {
    padding: 0;
    ${typography('body1')};
  }
`;

class JuiTextarea extends React.Component<IProps, IState> {
  constructor(props: IProps) {
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

  render() {
    const { innerRef, rows, ...textFieldRest } = this.props;
    const { hasValue } = this.state;
    const { onChange, ...rest } = textFieldRest;
    return (
      <Textarea
        multiline={true}
        hasValue={hasValue}
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

export default JuiTextarea;
