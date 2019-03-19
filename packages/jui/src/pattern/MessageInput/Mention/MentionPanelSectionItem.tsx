import React, { PureComponent, RefObject } from 'react';
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
  private _itemRef: RefObject<any> = React.createRef();
  // private _item: HTMLElement;
  // private _container: HTMLElement;

  // private _scrollItemInView() {
  //   const itemHeight = this._item.offsetHeight;
  //   const itemTop = this._item.offsetTop;
  //   const containerTop = this._container.scrollTop;
  //   const containerBottom = containerTop + this._container.offsetHeight;
  //   if (itemTop < containerTop) {
  //     // Scroll up if the item is above the top of the container
  //     this._container.scrollTop = itemTop;
  //   } else if (itemTop > containerBottom - itemHeight) {
  //     // scroll down if any part of the element is below the bottom of the container
  //     this._container.scrollTop += itemTop - containerBottom + itemHeight;
  //   }
  // }

  // componentDidUpdate(prevProps: Readonly<Props>) {
  //   const { selected } = this.props;
  //   if (selected && selected !== prevProps.selected) {
  //     this._scrollItemInView();
  //   }
  // }

  // componentDidMount() {
  //   const item = this._itemRef.current;
  //   if (item) {
  //     this._item = item;
  //     this._container = item.parentElement.parentElement;
  //   }
  // }

  render() {
    const { Avatar, displayName, selected, selectHandler } = this.props;
    return (
      <Wrapper
        className={selected ? 'selected' : ''}
        onMouseDown={selectHandler}
        ref={this._itemRef}
      >
        {Avatar}
        <DisplayName>{displayName}</DisplayName>
      </Wrapper>
    );
  }
}

export { JuiMentionPanelSectionItem };
