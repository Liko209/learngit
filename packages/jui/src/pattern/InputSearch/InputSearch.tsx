/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-28 10:50:37
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const StyledPaper = styled<PaperProps>(Paper)`
  &.root {
    display: "flex";
    border: 1px solid red !important;
  }
`;

const StyledInput = styled<InputBaseProps>(InputBase)`
  &.input {
    flex: 1;
  }
`;

type Props = {
  placeholder: string;
  ariaLabel: string;
};

class JuiInputSearch extends PureComponent<Props> {
  render() {
    const { placeholder, ariaLabel } = this.props;
    return (
      <StyledPaper elevation={1}>
        <IconButton aria-label={ariaLabel}>
          <SearchIcon />
        </IconButton>
        <StyledInput placeholder={placeholder} />
      </StyledPaper>
    );
  }
}

export { JuiInputSearch };
