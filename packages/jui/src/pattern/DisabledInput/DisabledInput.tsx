import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  shape,
  spacing,
  typography,
  palette,
} from '../../foundation/utils/styles';

interface IProps {
  text: string;
}

const StyledDisableInput = styled('div')`
  && {
    ${typography('body1')};
    color: ${palette('semantic', 'negative')};
    background-color: ${palette('background', 'disabled')};
    text-align: center;
    border: ${shape('border1')};
    border-radius: ${shape('borderRadius')};
    padding: ${spacing(2)};
    margin: ${spacing(4)};
  }
`;

class JuiDisabledInput extends PureComponent<IProps> {
  render() {
    const { text } = this.props;

    return <StyledDisableInput>{text}</StyledDisableInput>;
  }
}

export { JuiDisabledInput };
