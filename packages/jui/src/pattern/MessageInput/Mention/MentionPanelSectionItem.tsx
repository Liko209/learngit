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
  transition: background-color 0.2s ease-in;
  cursor: pointer;
  color: ${grey('900')};
  &&.selected {
    background-color: ${palette('primary', '700')};
    color: ${palette('common', 'white')};
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
        className={selected ? 'selected' : ''}
        onMouseDown={selectHandler}
      >
        {Avatar}
        <DisplayName>{displayName}</DisplayName>
      </Wrapper>
    );
  }
}

export { JuiMentionPanelSectionItem };
