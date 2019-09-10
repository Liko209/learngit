import React, { PureComponent } from 'react';
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  palette,
  typography,
  grey,
  ellipsis,
} from '../../../foundation/utils/styles';

const Wrapper = styled.div`
  height: ${height(10)};
  padding: ${spacing(0, 5)};
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${grey('900')};
  &&.selected {
    background-color: ${palette('primary', 'main')};
    color: ${({ theme }) =>
      theme.palette.getContrastText(palette('primary', 'main')({ theme }))};
  }
  &:hover {
    background-color: ${palette('grey', '50')};
  }
`;

const DisplayName = styled.span`
  ${typography('body1')};
  margin-left: ${spacing(3)};
  ${ellipsis()};
`;

type Props = {
  Avatar: JSX.Element;
  displayName: string;
  selected: boolean;
  selectHandler: (event: React.MouseEvent<HTMLDivElement>) => void;
};

class JuiMentionPanelSectionItem extends PureComponent<Props> {
  render() {
    const { Avatar, displayName, selected, selectHandler } = this.props;
    return (
      <Wrapper
        data-test-automation-class="match-item"
        data-test-automation-value={displayName.trim()}
        className={selected ? 'selected' : ''}
        onMouseDown={selectHandler}
      >
        {Avatar}
        <DisplayName aria-label="display-text">{displayName}</DisplayName>
      </Wrapper>
    );
  }
}

export { JuiMentionPanelSectionItem };
