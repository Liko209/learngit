import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  shape,
  spacing,
  typography,
  palette,
} from '../../foundation/utils/styles';

type Props = {
  text: string;
};

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

class JuiDisabledInput extends PureComponent<Props> {
  render() {
    const { text, ...rest } = this.props;

    return <StyledDisableInput {...rest}>{text}</StyledDisableInput>;
  }
}

export { JuiDisabledInput };
