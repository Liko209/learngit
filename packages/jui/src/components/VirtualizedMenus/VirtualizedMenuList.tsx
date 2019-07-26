/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:39:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useRef, useLayoutEffect } from 'react';
import { useFocusHelper } from '../../foundation/hooks/useFocusHelper';
import { JuiMenuItemProps } from '../Menus';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from '../VirtualizedList/VirtualizedList';
import { withAutoSizer } from '../AutoSizer';

const MENU_ITEM_HEIGHT = 32;
const List = withAutoSizer(JuiVirtualizedList);

type JuiVirtualizedMenuListProps = {
  focusOnHover?: boolean;
  loop?: boolean;
  autoFocus?: boolean;
  children: JSX.Element[];
};

function mapElementChild<T>(
  children: React.ReactNode,
  cb: (elementChild: React.ReactElement<JuiMenuItemProps>, i: number) => T,
) {
  return React.Children.map(children, (child, i) => {
    if (!React.isValidElement<JuiMenuItemProps>(child)) {
      throw new Error('Error: Invalid Element');
    }
    return cb(child, i);
  });
}

const JuiVirtualizedMenuList = (props: JuiVirtualizedMenuListProps) => {
  const { focusOnHover, autoFocus = false, loop = true } = props;

  const listRef = useRef<JuiVirtualizedListHandles>();

  const items = mapElementChild(props.children, child => {
    return {
      text: child.props.searchString,
      disabled: child.props.disabled,
    };
  });

  const { focusedIndex, setFocusedIndex, onKeyPress } = useFocusHelper({
    loop,
    items,
  });

  const handleKeyPress = (event: React.KeyboardEvent<HTMLUListElement>) => {
    event.preventDefault();
    onKeyPress(event.key);
  };

  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoViewIfNeeded(focusedIndex);
    }
  }, [focusedIndex]);

  const children = mapElementChild(
    props.children,
    (child: React.ReactElement<JuiMenuItemProps>, i: number) => {
      return React.cloneElement(child, {
        autoFocus: i === focusedIndex,
        onMouseEnter: () => focusOnHover && setFocusedIndex(i),
        onClick: (event: React.MouseEvent<HTMLLIElement>) => {
          setFocusedIndex(i);
          child.props.onClick && child.props.onClick(event);
        },
      });
    },
  );

  return (
    <List
      ref={listRef as any}
      minRowHeight={MENU_ITEM_HEIGHT}
      onKeyDown={handleKeyPress}
      tabIndex={autoFocus ? 0 : -1}
    >
      {children}
    </List>
  );
};

export { JuiVirtualizedMenuList, JuiVirtualizedMenuListProps };
