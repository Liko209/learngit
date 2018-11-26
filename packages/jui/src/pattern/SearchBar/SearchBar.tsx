/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:19:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiBackdrop, JuiBackdropProps } from '../../components/Backdrop';
import styled from '../../foundation/styled-components';

const JuiSearchBarWrapper = styled.div`
  position: relative;
`;

const StyledBackdrop = styled<JuiBackdropProps>(JuiBackdrop)`
  && {
    z-index: ${({ open }) => (open ? 1 : -1)};
  }
`;

type Props = {
  focus: boolean;
  onClose?: () => void;
};

class JuiSearchBar extends React.Component<Props, {}> {
  render() {
    const { children, focus, onClose } = this.props;
    return (
      <JuiSearchBarWrapper>
        <StyledBackdrop onClick={onClose} open={focus} />
        {children}
      </JuiSearchBarWrapper>
    );
  }
}

export { JuiSearchBar };
