/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:19:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiBackdrop, JuiBackdropProps } from '../../components/Backdrop';
import { width, spacing } from '../../foundation/utils/styles';
import styled from '../../foundation/styled-components';

const JuiSearchBarWrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: ${width(327)};
  margin: ${spacing(0, 5)};
  outline: none;
`;

const StyledBackdrop = styled<JuiBackdropProps>(JuiBackdrop)`
  && {
    position: ${({ open }) => (open ? 'fixed' : 'relative')};
    z-index: ${({ open, theme }) => (open ? theme.zIndex.drawer + 11 : -1)};
  }
`;

type Props = {
  focus: boolean;
  onClose?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  tabIndex?: number;
};

class JuiSearchBar extends React.Component<Props, {}> {
  render() {
    const { children, focus, onClose, ...rest } = this.props;
    return (
      <JuiSearchBarWrapper className="search-bar" {...rest}>
        <StyledBackdrop onClick={onClose} open={focus} />
        {children}
      </JuiSearchBarWrapper>
    );
  }
}

export { JuiSearchBar };
