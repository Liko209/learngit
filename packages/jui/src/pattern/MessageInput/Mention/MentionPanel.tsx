import React, { PureComponent } from 'react';
import styled, { withTheme } from '../../../foundation/styled-components';
import { ThemeProps } from '../../../foundation/theme/theme';
import {
  height,
  shape,
  spacing,
  palette,
} from '../../../foundation/utils/styles';

const Wrapper = styled.div<{
  isEditMode?: boolean;
}>`
  position: absolute;
  left: ${({ isEditMode }) => (isEditMode ? 0 : spacing(4.5))};
  right: ${({ isEditMode }) => (isEditMode ? 0 : spacing(4.5))};
  max-height: ${height(68)};
  box-shadow: ${props => props.theme.shadows[8]};
  overflow-y: auto;
  border-radius: ${shape('borderRadius')};
  background-color: ${palette('common', 'white')};
  z-index: ${({ theme }) => theme.zIndex.loading};
`;

type Props = {
  children: React.ReactChild;
  isEditMode?: boolean;
} & ThemeProps;

class MentionPanel extends PureComponent<Props> {
  wrapperRef: React.RefObject<any> = React.createRef();

  componentDidMount() {
    const wrapper = this.wrapperRef.current;
    const { isEditMode } = this.props;
    if (wrapper) {
      const offsetHeight = wrapper.parentElement.offsetHeight;
      wrapper.style.bottom = isEditMode
        ? `${spacing((offsetHeight + 2) / 4)(this.props)}`
        : `${spacing((offsetHeight - 38) / 4)(this.props)}`;
    }
  }

  render() {
    const { children, isEditMode } = this.props;
    return (
      <Wrapper isEditMode={isEditMode} ref={this.wrapperRef}>
        {children}
      </Wrapper>
    );
  }
}
const JuiMentionPanel = withTheme(MentionPanel);

export { JuiMentionPanel };
